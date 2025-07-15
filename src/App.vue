<template>
  <div class="warpper">
    <div>父组件activeTime的值: {{ activeTime }}</div>
    <div>使用方式</div>
    <pre>
      {{ code }}
    </pre>

    <DragChart v-model:active-time="activeTime" :value-data="valueData" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import dayjs from "dayjs";
const code = `<DragChart v-model:active-time="activeTime" :value-data="valueData" />`;

const activeTime = ref([
  dayjs().subtract(1, "day").startOf("day"),
  dayjs().subtract(1, "day").endOf("day"),
]);

const valueData = ref([
  dayjs().subtract(1, "day").set("hour", 1),
  dayjs().subtract(1, "day").set("hour", 2),
  dayjs().subtract(1, "day").set("hour", 3),
  dayjs().subtract(1, "day").set("hour", 4),
  dayjs().subtract(1, "day").set("hour", 5),
  dayjs().subtract(1, "day").set("hour", 6),
]);
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
  width: 100%;
  height: 200px;
}
</style>
