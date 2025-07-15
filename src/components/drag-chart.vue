<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart-wrap"></div>
  </div>
</template>

<script lang="ts" setup name="DragChart">
import dayjs from "dayjs";
import * as echarts from "echarts";
import {
  computed,
  onMounted,
  onBeforeUnmount,
  PropType,
  ref,
  watch,
  onBeforeMount,
} from "vue";
import { useResizeObserver } from "@vueuse/core";

const props = defineProps({
  // x轴的开始和结束时间
  timeRange: {
    type: Array as PropType<(string | Date | dayjs.Dayjs)[]>,
    default: () => [dayjs().subtract(1, "day"), dayjs()],
  },
  // 开始图标
  startIcon: {
    type: String,
    default: "https://img.icons8.com/material-outlined/24/000000/left2.png",
  },
  // 结束图标
  endIcon: {
    type: String,
    default: "https://img.icons8.com/material-outlined/24/000000/right2.png",
  },
  // 拖拽点的大小
  symbolSize: {
    type: Number,
    default: 20,
  },
  // 目前是有值的柱子
  valueData: {
    type: Array,
    default: () => [],
  },
  // 当前时间范围
  activeTime: {
    type: Array,
    default: () => [0, 12],
  },
  // X轴的间隔
  interval: {
    type: Number,
    default: 4,
  },
  autoInterval: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:activeTime"]);

const chartRef = ref();
let myChart: echarts.EChartsType;

const MaxTick = computed(() => 24 * props.timeRange.length - 1);
// 图表初始化Axis data
const xAxisData = computed(() => {
  const result = [];
  const startDate = dayjs(props.timeRange[0]);
  const endDate = dayjs(props.timeRange[props.timeRange.length - 1]);
  const diffDays = endDate.diff(startDate, "day");
  for (let i = 0; i <= diffDays; i++) {
    const currentDate = startDate.add(i, "day");
    for (let j = 0; j < 24; j++) {
      result.push(currentDate.hour(j).format("YYYY-MM-DD HH:00:00"));
    }
  }
  return result;
});

const data = computed({
  get() {
    return getInitialData();
  },
  set(val) {
    emit("update:activeTime", val);
  },
});

const getInitialData = () => {
  if (!props.activeTime || props.activeTime.length !== 2) {
    return [
      [0, 0],
      [xAxisData.value.length - 1, 0],
    ];
  }
  const x1 = xAxisData.value.findIndex((x) =>
    dayjs(x).isSame(dayjs(props.activeTime[0]), "hour")
  );
  const x2 = xAxisData.value.findIndex((x) =>
    dayjs(x).isSame(dayjs(props.activeTime[1]), "hour")
  );
  return [
    [x1, 0],
    [x2, 0],
  ];
};

const handlerResize = () => {
  if (myChart) {
    myChart.resize({
      width: "auto",
      height: "auto",
    });
  }
};
useResizeObserver(chartRef, handlerResize);

// 实际展示的节点个数
const intervalReal = computed(() => {
  return Math.floor((MaxTick.value - 1) / 12) + 1;
});

// 有数据的模块
const barData = computed(() => {
  if (!props.valueData || props.valueData.length === 0) {
    return [];
  }
  // 去除valueData 小时相同的数据(分/秒暂时不处理)
  const filteredData = props.valueData.reduce((acc: string[], cur: string) => {
    const lastItem = acc[acc.length - 1];
    if (lastItem && dayjs(lastItem).hour() === dayjs(cur).hour()) {
      return acc;
    }
    return [
      ...acc,
      dayjs(cur)
        .set("minute", 0)
        .set("second", 0)
        .format("YYYY-MM-DD HH:mm:ss"),
    ];
  }, []);

  return filteredData;
});
// 工具函数
const generateInitialPoints = (x1: number, x2: number) => {
  const points = [];
  for (let x = x1; x <= x2; x += 1) {
    points.push([x, 2]);
  }
  return points;
};

// 事件处理函数
const updatePosition = () => {
  myChart.setOption({
    graphic: data.value.map((item) => ({
      position: myChart.convertToPixel("grid", item),
    })),
  });
};

const showTooltip = (dataIndex: number) => {
  myChart.dispatchAction({
    type: "showTip",
    seriesIndex: 0,
    dataIndex: dataIndex,
  });
};

const hideTooltip = () => {
  myChart.dispatchAction({
    type: "hideTip",
  });
};

const updateChartData = () => {
  const x1 = Math.min(data.value[0][0], data.value[1][0]);
  const x2 = Math.max(data.value[0][0], data.value[1][0]);
  const initialPoints = generateInitialPoints(x1, x2);
  // 判断两个点的相对位置
  const point0X = data.value[0][0];
  const point1X = data.value[1][0];
  const isPoint0First = point0X < point1X;

  myChart.setOption({
    series: [
      {
        id: "a",
        data: data.value,
        z: 80,
        silent: true,
        animation: false,
        symbolSize: 20, // TODO: 待确认
      },
      {
        id: "b",
        data: initialPoints,
        type: "line",
        areaStyle: {
          color: "rgba(160,210,255,0.14)",
        },
        symbolSize: 0,
        markLine: getBorderStyle(initialPoints),
        z: 90,
        silent: true,
        animation: false,
      },
    ],
  });

  myChart.setOption({
    graphic: data.value.map((item, idx) => ({
      position: myChart.convertToPixel("grid", item),
      type: "image",
      style: {
        image: (isPoint0First ? idx === 0 : idx === 1)
          ? props.startIcon
          : props.endIcon,
        width: props.symbolSize,
        height: props.symbolSize,
        x: -props.symbolSize / 2,
        y: -props.symbolSize / 2,
      },
      invisible: false,
      z: 100,
    })),
  });
};

const updateActiveTime = () => {
  emit(
    "update:activeTime",
    data.value.map((item) => xAxisData.value[item[0]])
  );
};

const onDragEnd = (dataIndex: number, pos: number[]) => {
  const newPos = myChart.convertFromPixel("grid", pos);
  newPos[0] = Math.round(Math.min(Math.max(newPos[0], 0), MaxTick.value));
  newPos[1] = data.value[dataIndex][1];
  data.value[dataIndex] = newPos;
  updateChartData();
  updateActiveTime();
};

const onPointDragging = (dataIndex: number, pos: number[]) => {
  const newPos = myChart.convertFromPixel("grid", pos);
  newPos[0] = Math.min(Math.max(newPos[0], 0), MaxTick.value);
  newPos[1] = data.value[dataIndex][1];
  data.value[dataIndex] = newPos;
  updateChartData();
};

// 添加滚轮缩放处理函数
const handleWheel = (e: WheelEvent) => {
  if (!e.ctrlKey && !e.shiftKey) return;
  e.preventDefault();

  const delta = e.deltaY;
  const currentRange = Math.abs(data.value[1][0] - data.value[0][0]);

  // Shift pressed - handle horizontal movement
  if (e.shiftKey) {
    const moveStep = 2; // Adjust this value to control movement speed
    const moveAmount = delta > 0 ? moveStep : -moveStep;

    let newStart = data.value[0][0] + moveAmount;
    let newEnd = data.value[1][0] + moveAmount;

    // Ensure movement stays within bounds
    if (newStart < 0) {
      newStart = 0;
      newEnd = currentRange;
    }
    if (newEnd > MaxTick.value) {
      newEnd = MaxTick.value;
      newStart = MaxTick.value - currentRange;
    }

    data.value[0] = [newStart, 0];
    data.value[1] = [newEnd, 0];
    updateChartData();
    updateActiveTime();
    return;
  }

  // Ctrl pressed - handle zoom
  const scaleFactor = 0.1;
  if (currentRange <= 4 && delta > 0) return;

  // 分别处理放大和缩小
  let newRange =
    delta > 0
      ? Math.min(MaxTick.value, currentRange * (1 + scaleFactor)) // 放大
      : Math.max(4, currentRange * (1 - scaleFactor)); // 缩小，确保不小于4

  const center = (data.value[0][0] + data.value[1][0]) / 2;
  let newStart = Math.round(center - newRange / 2);
  let newEnd = Math.round(center + newRange / 2);

  // 边界处理
  if (newStart < 0) {
    newStart = 0;
    newEnd = Math.min(MaxTick.value, Math.round(newRange));
  }
  if (newEnd > MaxTick.value) {
    newEnd = MaxTick.value;
    newStart = Math.max(0, Math.round(MaxTick.value - newRange));
  }

  // 确保范围合法
  if (newEnd - newStart < 4) {
    return;
  }
  data.value[0] = [newStart, 0];
  data.value[1] = [newEnd, 0];
  updateChartData();
  updateActiveTime();
};

// 图表配置
const getChartOption = (): echarts.EChartsOption => {
  const x1 = Math.min(data.value[0][0], data.value[1][0]);
  const x2 = Math.max(data.value[0][0], data.value[1][0]);
  const initialPoints = generateInitialPoints(x1, x2);
  const datalist = barData.value.map(
    (item: string | number | Date | dayjs.Dayjs | null | undefined) => {
      const index = xAxisData.value.findIndex((x) =>
        dayjs(x).isSame(dayjs(item), "hour")
      );
      return [index, 1];
    }
  );

  const seriesData: echarts.SeriesOption[] = [
    {
      id: "b",
      type: "line",
      data: initialPoints,
      areaStyle: {
        color: "rgba(160,210,255,0.14)",
      },
      lineStyle: {
        color: "#5CB0FE",
        width: 1,
      },
      symbol: "none",
      markLine: getBorderStyle(initialPoints),
      z: 100,
      silent: true,
      animation: false,
    },
    {
      id: "c",
      type: "bar",
      data: datalist,
      barWidth: 20,
      itemStyle: {
        color: "#C2E2FF",
        borderRadius: [3, 3, 0, 0],
      },
      z: 0,
      silent: true,
      animation: false,
    },
  ];

  return {
    tooltip: {
      triggerOn: "none",
      formatter: function (params) {
        const result = xAxisData.value[Math.round(params.data[0])];
        return dayjs(result).format("MM/DD HH:mm");
      },
    },
    grid: {
      top: "50%",
      left: "50",
      right: "50",
    },
    xAxis: {
      min: 0,
      max: MaxTick.value,
      interval: props.autoInterval ? intervalReal.value : props.interval,
      type: "value",
      // boundaryGap: "0%",
      boundaryGap: ["0%", "100%"],
      axisLine: { onZero: false },
      axisTick: { inside: true },
      splitLine: { show: false },
      axisLabel: {
        formatter: function (value: any) {
          let result = xAxisData.value[value];
          const hour = dayjs(result).hour();
          if (hour == 0) {
            return `{datebox|}{date|${dayjs(result).format("MM/DD")}}`;
          }
          return `{time|${hour}:00}`;
        },

        rich: {
          datebox: {
            width: 40,
          },
          date: {
            color: "#333333",
            backgroundColor: "rgba(51,51,51,0.08)",
            padding: 4,
            borderRadius: 10,
          },
          time: {
            color: "#666",
          },
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        id: "a",
        type: "line",
        smooth: true,
        data: data.value,
        areaStyle: {},
        symbolSize: 20, // TODO: 待确认 // props.symbolSize,
      },
      ...seriesData,
    ],
  };
};

const getBorderStyle = (initialPoints: string | any[]): any => {
  return {
    symbol: "none",
    animation: false,
    z: 0,
    lineStyle: {
      color: "#5CB0FE",
      width: 1,
      type: "solid",
    },
    data: [
      // 左侧竖线
      [
        { coord: [initialPoints[0][0], 0] },
        { coord: [initialPoints[0][0], initialPoints[0][1]] },
      ],
      // 右侧竖线
      [
        { coord: [initialPoints[initialPoints.length - 1][0], 0] },
        {
          coord: [
            initialPoints[initialPoints.length - 1][0],
            initialPoints[initialPoints.length - 1][1],
          ],
        },
      ],
      // 底部横线
      // [
      //   { coord: [initialPoints[0][0], 0] },
      //   { coord: [initialPoints[initialPoints.length - 1][0], 0] },
      // ],
    ],
  };
};

const onChartClick = (params: any) => {
  // console.log('Chart clicked:', params)
  // 获取点击的坐标
  const pointInPixel = [params.offsetX, params.offsetY];
  // 将像素坐标转换为数据坐标
  const pointInData = myChart.convertFromPixel(
    { seriesIndex: 0 },
    pointInPixel
  );
  // console.log('Clicked position in data:', pointInData)
  // 这里可以添加你的业务逻辑
  // 例如：添加新的数据点
};

// onBeforeMount(() => {
//   if (props.activeTime) {
//     const x1 = xAxisData.value.findIndex((x) =>
//       dayjs(x).isSame(dayjs(props.activeTime[0]), "hour")
//     );
//     const x2 = xAxisData.value.findIndex((x) =>
//       dayjs(x).isSame(dayjs(props.activeTime[1]), "hour")
//     );
//     data.value = [
//       [x1, 0],
//       [x2, 0],
//     ];
//   }
// });

// 初始化图表
onMounted(() => {
  myChart = echarts.init(chartRef.value as HTMLElement, null, {
    renderer: "svg",
  });
  myChart.setOption(getChartOption());

  // 设置拖拽点
  setTimeout(() => {
    myChart.setOption({
      graphic: data.value.map((item, dataIndex) => ({
        type: "image",
        position: myChart.convertToPixel("grid", item),
        style: {
          image: dataIndex === 0 ? props.startIcon : props.endIcon,
          width: props.symbolSize,
          height: props.symbolSize,
          x: -props.symbolSize / 2,
          y: -props.symbolSize / 2,
        },
        invisible: false,
        draggable: "horizontal",
        ondrag: function (dx, dy) {
          onPointDragging(dataIndex, [this.x, this.y]);
        },
        ondragend: function () {
          onDragEnd(dataIndex, [this.x, this.y]);
        },
        onmousemove: function () {
          showTooltip(dataIndex);
        },
        onmouseout: function () {
          hideTooltip();
        },
        z: 200,
      })),
    });
  }, 0);

  // 添加事件监听
  window.addEventListener("resize", updatePosition);
  myChart.on("dataZoom", updatePosition);
  // 添加点击事件监听
  myChart.getZr().on("click", onChartClick);

  // 添加滚轮事件监听
  chartRef.value.addEventListener("wheel", handleWheel, { passive: false });
});

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener("resize", updatePosition);
  myChart.off("dataZoom", updatePosition);
  myChart.getZr().off("click", onChartClick);
  chartRef.value?.removeEventListener("wheel", handleWheel);
});

watch(
  () => props.timeRange,
  (newValue) => {
    // 更新数据
    if (!myChart) return;
    // 更新图表
    myChart.setOption(getChartOption());
    // 更新拖拽点位置
    updatePosition();
  },
  { immediate: true }
);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
.chart-wrap {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
}
</style>
