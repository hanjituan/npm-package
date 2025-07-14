<template>
  <div class="warpper">
    <DragChart />
  </div>
</template>

<script setup>
import DragChart from "./components/drag-chart.vue";
</script>

<style scoped>
*{
  box-sizing: border-box;
}
.warpper {
  border: 1px solid red;
  width: 100%;
  height: 200px;
}
</style>
