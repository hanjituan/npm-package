<template>
  <div class="warpper">
    <DragChart v-model:active-time="activeTime" />
  </div>
</template>

<script setup>
import DragChart from "./components/drag-chart.vue";
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
}
.warpper {
  border: 1px solid red;
  width: 100%;
  height: 200px;
}
</style>
