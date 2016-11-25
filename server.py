import time
import subprocess
import urllib2
import json
import xml.etree.ElementTree as ET

from collections import OrderedDict
from urllib import quote_plus

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer


class View(object):

    def __init__(self, *args, **kwargs):
        self.context = kwargs.get('context', dict())

    def render_template(self, template):
        for name, value in self.context.iteritems():
            var_name = '{{ ' + name.upper() + ' }}'
            template = template.replace(var_name, value)
        return template


class SinglePageAppView(View):
    template_filename = 'templates/app.html'

    def get(self, response):
        template = open(self.template_filename, 'r').read()
        app_html = self.render_template(template)

        response.send_response(200)
        response.send_header('Content-type', 'text/html')
        response.end_headers()
        response.wfile.write(app_html)


class CurrentTrackView(View):

    def __init__(self, *args, **kwargs):
        super(CurrentTrackView, self).__init__(self, *args, **kwargs)
        self.spotify_control = LocalSpotifyControl()
        self.spotify_web_api = SpotifyWebAPI()
        self.lyrics_finder = LyricsFinder()

    def get(self, response):
        current_track_id = self.spotify_control.get_current_track_id()
        track = self.spotify_web_api.get_track(current_track_id)
        lyrics = self.lyrics_finder.find_for_track(track)

        payload_data = track
        payload_data['lyrics'] = lyrics or 'Could not find lyrics'
        payload = json.dumps(payload_data)

        response.send_response(200)
        response.send_header('Content-type', 'application/json')
        response.send_header('Access-Control-Allow-Origin', '*')
        response.end_headers()
        response.wfile.write(payload)


class RequestHandler(BaseHTTPRequestHandler):
    ROUTES = {
        '/': SinglePageAppView,
        '/current_track.json': CurrentTrackView
    }

    def do_GET(self):
        view = self.ROUTES.get(self.path)
        if view:
            return view(context=get_context()).get(self)

        self.send_response(404)


_lyrics_memory_cache = None

class LyricsMemoryCache(object):
    """ Primitive in-memory cache that evicts a ratio of its maximum entries
    whenever it fills up.

    The memory ceiling makes it a little bit more safe for long-term running
    as a daemon while also preventing repeated requests to the lyrics server.

    The eviction system assumes the user is listening the same songs
    reapetedly. This behavior could also happen as a side-effect of listening
    to the same playlists repeatedly.

    I took a gamble based on my own listening behavior (at most 2-4 different
    playlists per day, average playlist size 20 items). This would make the
    cache hit rate tend to 100% by the end of the day, while also automatically
    adjusting to a new listening pattern.

    In order to evict only the older items (FIFO) we implement the cache using
    OrderedDict.
    """
    MAX_ENTRIES = 100
    EVICT_RATIO = 0.3

    def __init__(self):
        self.cache = OrderedDict()

    def get(self, key):
        return self.cache.get(key)

    def set(self, key, val):
        self.cache[key] = val
        self.evict_if_required()

    def evict_if_required(self):
        if len(self.cache) > self.MAX_ENTRIES:
            evict_amount = int(self.MAX_ENTRIES * self.EVICT_RATIO)

            for i in xrange(evict_amount):
                # FIFO pop
                self.cache.popitem(last=False)

    @staticmethod
    def get_instance():
        global _lyrics_memory_cache
        if _lyrics_memory_cache is None:
            _lyrics_memory_cache = LyricsMemoryCache()
        return _lyrics_memory_cache


class LyricsFinder(object):
    API_URL = 'http://api.chartlyrics.com/apiv1.asmx'
    SEARCH_URL = '/'.join([API_URL, 'SearchLyric'])
    GET_URL = '/'.join([API_URL, 'GetLyric'])

    def find_for_track(self, track):
        lyrics_cache = LyricsMemoryCache.get_instance()

        track_name = track['name']
        artist_names = [artist['name'] for artist in track['artists']]
        collab_name = ','.join(artist_names)

        # Try cache
        cache_key = '{} - {}'.format(collab_name, track_name)
        lyrics = lyrics_cache.get(cache_key)
        if lyrics is not None:
            return lyrics

        # Songs might have multiple artists associated. We start by querying
        # their names together, then each one individually.
        tests = []

        # Collaboration between multiple artists
        if len(artist_names) > 0:
            tests.append(quote_plus(collab_name))

        # Individual artists attempts
        for artist in artist_names:
            tests.append(quote_plus(artist))

        for artist_name in tests:
            candidates = self.search(artist_name, track_name)

            for lyric_id, checksum in candidates:
                try:
                    lyrics = self.get_by_id_and_checksum(lyric_id, checksum)

                    # Stop if we already found one
                    if lyrics is not None:
                        break
                except:
                    pass

            # Stop if we already found one
            if lyrics is not None:
                break

        if lyrics is not None:
            lyrics_cache.set(cache_key, lyrics)

        return lyrics

    def search(self, artist_name, track_name):
        query = 'artist={}&song={}'.format(artist_name, quote_plus(track_name))
        url = '?'.join([self.SEARCH_URL, query])

        try:
            data = fetch_from_url(url)
        except:
            return []

        # Hack: the presence of the xmlns complicates all XPath queries
        data = data.replace('xmlns="http://api.chartlyrics.com/"', '')
        candidates = []

        try:
            root = ET.fromstring(data)

            for child in list(root):
                try:
                    lyric_id = child.findall('./LyricId')[0].text
                    lyric_checksum = child.findall('./LyricChecksum')[0].text

                    candidates.append((lyric_id, lyric_checksum))
                except:
                    pass
        except:
            pass

        return candidates

    def get_by_id_and_checksum(self, lyric_id, lyric_checksum):
        query = 'lyricId={}&lyricCheckSum={}'.format(lyric_id, lyric_checksum)
        url = '?'.join([self.GET_URL, query])
        data = fetch_from_url(url)

        # Hack: the presence of the xmlns complicates all XPath queries
        data = data.replace('xmlns="http://api.chartlyrics.com/"', '')

        try:
            lyrics_root = ET.fromstring(data)
            return lyrics_root.findall('./Lyric')[0].text
        except e:
            pass


class LocalSpotifyControl(object):

    def get_current_track_id(self):
        command = ["osascript", "control/get_current_track_id.scpt"]
        output = subprocess.check_output(command)
        output = output.replace('\n', '')
        track_id = output.split(':')[-1]
        return track_id


class SpotifyWebAPI(object):
    API_URL = 'https://api.spotify.com/v1'

    def get_track(self, track_id):
        url = '/'.join([self.API_URL, 'tracks', track_id])
        return fetch_json_from_url(url)


_context = dict()

def get_context():
    global _context
    return _context


def fetch_json_from_url(url):
    data = fetch_from_url(url)
    return json.loads(data)


def fetch_from_url(url):
    return urllib2.urlopen(url).read()


if __name__ == '__main__':
    HOST, PORT = '0.0.0.0', 8000

    context = get_context()
    context['server_url'] = 'http://{}:{}'.format(HOST, PORT)

    httpd = HTTPServer((HOST, PORT), RequestHandler)

    try:
        print "Lyrics hosted locally at {}".format(context['server_url'])
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

