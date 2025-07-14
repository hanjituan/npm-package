<template>
  <div class="warpper">
    <DragChart />
  </div>
</template>

<script setup>
import DragChart from "./components/drag-chart.vue";
</script>

<style scoped>
.warpper {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
</style>
