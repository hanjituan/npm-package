import { DefineComponent } from 'vue'
import { Dayjs } from 'dayjs'

export type TimeValue = string | Date | Dayjs
export type TimeRange = [TimeValue, TimeValue]

export interface DragChartProps {
  /**
   * x轴的开始和结束时间
   * @default [dayjs().subtract(1, "day"), dayjs()]
   */
  timeRange?: TimeRange
  
  /**
   * 拖拽开始的icon
   * @default "https://img.icons8.com/material-outlined/24/000000/left2.png"
   */
  startIcon?: string
  
  /**
   * 拖拽结束的icon
   * @default "https://img.icons8.com/material-outlined/24/000000/right2.png"
   */
  endIcon?: string
  
  /**
   * 拖拽点的大小
   * @default 20
   */
  symbolSize?: number
  
  /**
   * 有数据的内容部分
   * @default []
   */
  valueData?: TimeValue[]
  
  /**
   * 当前时间范围, v-model:activeTime的值
   * @default [0, 12]
   */
  activeTime?: TimeRange
  
  /**
   * X轴的间隔
   * @default 4
   */
  interval?: number
  
  /**
   * 是否自动计算间隔
   * @default true
   */
  autoInterval?: boolean
  
  /**
   * 是否支持点击修改位置
   * @default true
   */
  needClick?: boolean
  
  /**
   * 最大选择范围（小时）
   * @default 168
   */
  maxRange?: number
  
  /**
   * 最小选择范围（小时）
   * @default 3
   */
  minRange?: number
  
  /**
   * 覆盖区域颜色
   * @default "rgba(160,210,255,0.14)"
   */
  coverColor?: string
  
  /**
   * 线段颜色
   * @default "#5CB0FE"
   */
  lineColor?: string
}

export interface OutOfRangeEvent {
  type: 'min' | 'max'
  currentRange: number
  minRange?: number
  maxRange?: number
}

export interface DragChartEmits {
  /**
   * 当前时间范围变化
   */
  'update:activeTime': [activeTime: TimeRange]
  
  /**
   * 拖拽超出范围
   */
  'outOfRange': [event: OutOfRangeEvent]
}

declare const DragChart: DefineComponent<DragChartProps, {}, {}, {}, {}, {}, {}, DragChartEmits>

export default DragChart
