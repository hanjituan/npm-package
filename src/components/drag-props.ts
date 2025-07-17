import { PropType } from "vue";
import dayjs from "dayjs";
import LeftImg from "@/assets/imgs/arrow-circle-left.png";
import RightImg from "@/assets/imgs/arrow-circle-right.png";

export default {
  // x轴的开始和结束时间
  timeRange: {
    type: Array as PropType<(string | Date | dayjs.Dayjs)[]>,
    default: () => [dayjs().subtract(1, "day"), dayjs()],
  },
  // 开始图标
  startIcon: {
    type: String,
    default: LeftImg,
  },
  // 结束图标
  endIcon: {
    type: String,
    default: RightImg,
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
  // 是否自动计算间隔, 如果为true，则interval会被忽略
  autoInterval: {
    type: Boolean,
    default: true,
  },
  // 是否支持点击修改位置
  needClick: {
    type: Boolean,
    default: true,
  },
  // 最大选择范围（小时）
  maxRange: {
    type: Number,
    default: 7 * 24, // 3天 = 72小时
  },
  // 最小选择范围（小时）
  minRange: {
    type: Number,
    default: 3, // 3小时
  },
  // 覆盖颜色
  coverColor: {
    type: String,
    default: "rgba(160,210,255,0.14)", // 默认颜色
  },
  // 线段颜色
  lineColor: {
    type: String,
    default: "#5CB0FE", // 默认线条颜色
  },
};

// 事件: outOfRange 拖拽超出范围
//  参数 {
//         type: "min",
//         currentRange,
//         minRange: props.minRange,
//       }
