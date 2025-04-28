<template>
  <div class="app">
    <FireText
      text="nrrb"
      :fontSize="30"
      fontFamily="'Arial Black', Gadget, sans-serif"
      :intensity="255"
      :cooling="1"
      :spreadRate="10"
    />
  </div>
</template>

<script>
import FireText from './components/FireText.vue'

export default {
  name: 'App',
  components: {
    FireText
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.app {
  height: 100vh;
  width: 100vw;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>