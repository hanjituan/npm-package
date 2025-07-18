<template>
  <div class="warpper">
    <DragChart
      v-model:active-time="activeTime"
      :value-data="valueData"
      :timeRange="timeRange"
      style="height: 200px"
    />

    <div class="info">父组件activeTime的值: {{ activeTime }}</div>
    <pre class="code-block">
      {{ code }}
    </pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import dayjs from "dayjs";

const code = ` <DragChart
          v-model:active-time="activeTime"
          :value-data="valueData"
          :timeRange="timeRange"
        />`;

const activeTime = ref([
  dayjs().subtract(5, "day").startOf("day"),
  dayjs().subtract(4, "day").startOf("day"),
]);

const valueData = ref([
  dayjs().subtract(5, "day").set("hour", 1),
  dayjs().subtract(5, "day").set("hour", 2),
  dayjs().subtract(5, "day").set("hour", 11),
  dayjs().subtract(5, "day").set("hour", 12),
  dayjs().subtract(5, "day").set("hour", 22),
  dayjs().subtract(4, "day").set("hour", 6),
]);

const timeRange = ref([
  dayjs().subtract(2, "day").startOf("day"),
  dayjs().subtract(1, "day").endOf("day"),
]);
</script>

<style scoped>
.warpper {
  width: 100%;
  overflow: hidden;
  border: 1px solid red;
}
.info {
  margin: 10px 0;
  font-size: 14px;
  color: #333;
}
.code-block {
  width: 100%;
  height: 200px;
  font-size: 16px;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}
</style>
