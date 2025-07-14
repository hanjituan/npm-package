<template>
  <div>
    <h1>Welcome to Your Vue.js App</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>. 
      You can also check out
      <a href="https://github.com/vuejs/vue-cli/tree/dev/docs" target="_blank" rel="noopener">this guide</a>
      to get started.
    </p>
    <DragChart />
  </div>
</template>

<script setup>
import DragChart from './components/drag-chart.vue';
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
