const path = require('path');

const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = {
  devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',
  entry: './lib/index.js',
  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { // eslint-disable-line quote-props
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new Copy([
      {
        from: './assets',
        to: './assets'
      }
    ])
  ],
  target: 'electron'
};
