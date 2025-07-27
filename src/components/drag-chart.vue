<template>
  <div
    ref="chartRef"
    style="min-width: 100px; min-height: 10px; height: 100%; width: 100%"
    class="chart-wrap"
  ></div>
</template>

<script lang="ts" setup name="DragChart">
import dayjs from "dayjs";
import * as echarts from "echarts";
import dragProps from "./drag-props";
import { useResizeObserver } from "@vueuse/core";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  ...dragProps,
});

// 更新时间, 超出范围事件
const emit = defineEmits(["update:activeTime", "outOfRange"]);

const chartRef = ref();
let myChart: echarts.EChartsType;

const getDiffDays = (
  startDate = props.timeRange[0],
  endDate = props.timeRange[props.timeRange.length - 1]
) => {
  return dayjs(endDate).diff(startDate, "day") + 1;
};

const MaxTick = computed(() => {
  const diffDays = getDiffDays();
  return diffDays * 24;
});
// 图表初始化Axis data
const xAxisData = computed(() => {
  const result: string[] = [];
  const startDate = dayjs(props.timeRange[0]);
  const diffDays = getDiffDays();
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
  // 判断 activeTime 是否在 timeRange 范围内
  if (
    dayjs(props.activeTime[0]).isBefore(dayjs(props.timeRange[0])) ||
    dayjs(props.activeTime[1]).isAfter(
      dayjs(props.timeRange[props.timeRange.length - 1])
    )
  ) {
    emit("outOfRange", {
      type: "activeTime",
      value: props.activeTime,
      timeRange: props.timeRange,
      message: "activeTime is out of timeRange",
    });
    return [
      [0, 0],
      [24, 0],
    ];
  }
  const x1 = xAxisData.value.findIndex((x) =>
    dayjs(x).isSame(
      dayjs(props.activeTime[0] as string | Date | dayjs.Dayjs),
      "hour"
    )
  );
  const x2 = xAxisData.value.findIndex((x) =>
    dayjs(x).isSame(
      dayjs(props.activeTime[1] as string | Date | dayjs.Dayjs),
      "hour"
    )
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

  // 过滤掉不在timeRange范围内的数据
  const start = dayjs(props.timeRange[0]);
  const end = dayjs(props.timeRange[props.timeRange.length - 1]);
  const filteredDatas = filteredData.filter((item) => {
    const date = dayjs(item);
    return date.isAfter(start) && date.isBefore(end);
  });

  return filteredDatas;
});
// 工具函数
const generateInitialPoints = (x1: number, x2: number) => {
  const points = [];
  for (let x = x1; x <= x2; x += 1) {
    points.push([x, 2]);
  }
  return points;
};

// 验证和调整范围的工具函数
const validateRange = (leftX: number, rightX: number) => {
  const currentRange = Math.abs(rightX - leftX);

  // 确保最小范围
  if (currentRange < props.minRange) {
    const center = (leftX + rightX) / 2;
    const halfMinRange = props.minRange / 2;
    leftX = Math.max(0, center - halfMinRange);
    rightX = Math.min(MaxTick.value, center + halfMinRange);

    // 如果调整后仍然不满足最小范围，优先保证范围大小
    if (rightX - leftX < props.minRange) {
      if (leftX === 0) {
        rightX = Math.min(MaxTick.value, props.minRange);
      } else if (rightX === MaxTick.value) {
        leftX = Math.max(0, MaxTick.value - props.minRange);
      }
    } else {
      // console.log(`当前范围: ${currentRange}, 最小范围: ${props.minRange}`);
      emit("outOfRange", {
        type: "min",
        currentRange,
        minRange: props.minRange,
      });
    }
  }

  // 确保最大范围
  if (currentRange > props.maxRange) {
    const center = (leftX + rightX) / 2;
    const halfMaxRange = props.maxRange / 2;
    leftX = Math.max(0, center - halfMaxRange);
    rightX = Math.min(MaxTick.value, center + halfMaxRange);

    // 如果调整后超出边界，需要重新调整
    if (leftX === 0 && rightX - leftX > props.maxRange) {
      rightX = props.maxRange;
    } else if (rightX === MaxTick.value && rightX - leftX > props.maxRange) {
      leftX = MaxTick.value - props.maxRange;
    } else {
      console.log(`当前范围: ${currentRange}, 最大范围: ${props.maxRange}`);
      emit("outOfRange", {
        type: "max",
        currentRange,
        minRange: props.minRange,
      });
    }
  }

  return {
    leftX: Math.round(leftX),
    rightX: Math.round(rightX),
  };
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
        symbolSize: 0,
      },
      {
        id: "lineRange",
        data: initialPoints,
        type: "line",
        areaStyle: {
          color: props.coverColor,
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

  // 临时更新位置
  data.value[dataIndex] = newPos;

  // 获取当前左右两个点的位置
  const leftX = Math.min(data.value[0][0], data.value[1][0]);
  const rightX = Math.max(data.value[0][0], data.value[1][0]);

  // 验证和调整范围
  const { leftX: validLeftX, rightX: validRightX } = validateRange(
    leftX,
    rightX
  );

  // 更新到验证后的位置
  const leftPointIndex = data.value[0][0] <= data.value[1][0] ? 0 : 1;
  const rightPointIndex = leftPointIndex === 0 ? 1 : 0;

  data.value[leftPointIndex] = [validLeftX, 0];
  data.value[rightPointIndex] = [validRightX, 0];

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

  // 检查是否已达到最小/最大范围限制
  if (currentRange <= props.minRange && delta > 0) return; // 已经是最小范围，不能再缩小
  if (currentRange >= props.maxRange && delta < 0) return; // 已经是最大范围，不能再放大

  // 分别处理放大和缩小
  let newRange =
    delta > 0
      ? Math.min(
          props.maxRange,
          Math.min(MaxTick.value, currentRange * (1 + scaleFactor))
        ) // 缩小（增加范围），但不超过最大范围
      : Math.max(props.minRange, currentRange * (1 - scaleFactor)); // 放大（减少范围），但不小于最小范围

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

  // 使用验证函数确保范围合法
  const { leftX: validLeftX, rightX: validRightX } = validateRange(
    newStart,
    newEnd
  );

  data.value[0] = [validLeftX, 0];
  data.value[1] = [validRightX, 0];
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
      id: "lineRange",
      type: "line",
      data: initialPoints,
      areaStyle: {
        color: props.coverColor,
      },
      lineStyle: {
        color: props.lineColor,
        width: 1,
      },
      symbol: "none",
      markLine: getBorderStyle(initialPoints),
      z: 100,
      silent: true,
      animation: false,
    },
    {
      id: "barData",
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
        symbolSize: 0,
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
      color: props.lineColor,
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
  // 获取点击的坐标
  const pointInPixel = [params.offsetX, params.offsetY];
  // 将像素坐标转换为数据坐标
  const pointInData = myChart.convertFromPixel(
    { seriesIndex: 0 },
    pointInPixel
  );

  if (!pointInData || pointInData.length < 2) return;

  // 确保点击的 x 坐标在有效范围内
  const clickX = Math.round(
    Math.min(Math.max(pointInData[0], 0), MaxTick.value)
  );

  // 获取当前左右两个点的 x 坐标
  const leftPointX = Math.min(data.value[0][0], data.value[1][0]);
  const rightPointX = Math.max(data.value[0][0], data.value[1][0]);

  // 计算点击位置到左右两个点的距离
  const distanceToLeft = Math.abs(clickX - leftPointX);
  const distanceToRight = Math.abs(clickX - rightPointX);

  // 判断点击位置更靠近哪个点
  const isCloserToLeft = distanceToLeft <= distanceToRight;

  // 找出哪个是左边的点，哪个是右边的点
  const leftPointIndex = data.value[0][0] <= data.value[1][0] ? 0 : 1;
  const rightPointIndex = leftPointIndex === 0 ? 1 : 0;

  let newLeftX = leftPointX;
  let newRightX = rightPointX;

  if (isCloserToLeft) {
    // 更新左边的点，但要考虑范围限制
    const maxLeftX = rightPointX - props.minRange; // 保持最小范围
    const minLeftX = Math.max(0, rightPointX - props.maxRange); // 保持最大范围
    newLeftX = Math.max(minLeftX, Math.min(clickX, maxLeftX));
  } else {
    // 更新右边的点，但要考虑范围限制
    const minRightX = leftPointX + props.minRange; // 保持最小范围
    const maxRightX = Math.min(MaxTick.value, leftPointX + props.maxRange); // 保持最大范围
    newRightX = Math.min(maxRightX, Math.max(clickX, minRightX));
  }

  // 使用验证函数确保范围合法
  const { leftX: validLeftX, rightX: validRightX } = validateRange(
    newLeftX,
    newRightX
  );

  data.value[leftPointIndex] = [validLeftX, 0];
  data.value[rightPointIndex] = [validRightX, 0];

  // 更新图表和激活时间
  updateChartData();
  updateActiveTime();
};

const setGraphic = () => {
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
};

// 初始化图表
onMounted(() => {
  myChart = echarts.init(chartRef.value as HTMLElement, null, {
    renderer: "svg",
  });
  myChart.setOption(getChartOption());

  // 设置拖拽点
  setTimeout(() => {
    setGraphic();
  }, 0);

  // 添加事件监听
  window.addEventListener("resize", updatePosition);
  // TODO: dataZoom 待更新
  // myChart.on("dataZoom", updatePosition);
  if (props.needClick) {
    // 添加点击事件监听
    myChart.getZr().on("click", onChartClick);
  }

  // 添加滚轮事件监听
  chartRef.value.addEventListener("wheel", handleWheel, { passive: false });
});

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener("resize", updatePosition);
  // myChart.off("dataZoom", updatePosition);
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