<template>
  <div class="warpper">
    <dragchartDemo />
  </div>
</template>

<script setup>
import dragchartDemo from "./example/dragchart-demo.vue";
</script>

<style scoped>
* {
  box-sizing: border-box;
}
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
