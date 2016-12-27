<template>
  <div class='detector'>
    <h1>Automatically detecting Spotify...</h1>
    <spinner></spinner>
  </div>
</template>

<script>
  import Spinner from './Spinner.vue'

  export default {
    components: {Spinner}
  }
</script>

<style lang="sass">
  .detector {
    margin-top: 10%;
    text-align: center;
  }

  .detector h1, .detector div {
    display: block;
  }
</style>
