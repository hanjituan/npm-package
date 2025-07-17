### Drag Chart 组件 参数说明

| 参数         | 说明                                  | 类型                          | 默认值                                                                      |
| ------------ | ------------------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| timeRange    | x 轴的开始和结束时间                  | _string_ _Date_ _dayjs.Dayjs_ | [dayjs().subtract(1, "day"), dayjs()]                                       |
| startIcon    | 拖拽开始的 icon                       | string                        | [icon-left](https://img.icons8.com/material-outlined/24/000000/left2.png)   |
| endIcon      | 拖拽结束的 icon                       | string                        | [icon-right](https://img.icons8.com/material-outlined/24/000000/right2.png) |
| symbolSize   | 拖拽点的大小                          | _Number_                      | 20                                                                          |
| valueData    | 有数据的内容部分                      | _Array_                       | []                                                                          |
| activeTime   | 当前时间范围, v-model:activeTime 的值 | _Array_                       | [0,12]                                                                      |
| interval     | X 轴的间隔                            | Number                        | 4                                                                           |
| autoInterval | 是否自动计算间隔                      | Boolean                       | true                                                                        |
| needClick    | 是否支持点击修改位置                  | Boolean                       | true                                                                        |
| maxRange     | 最大选择范围（小时）                  | Number                        | 168 (7 天)                                                                  |
| minRange     | 最小选择范围（小时）                  | Number                        | 3                                                                           |
| coverColor   | 覆盖区域颜色                          | String                        | "rgba(160,210,255,0.14)"                                                    |
| lineColor    | 线段颜色                              | String                        | "#5CB0FE"                                                                   |

### 事件说明

| 事件名            | 说明             | 回调参数                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| update:activeTime | 当前时间范围变化 | (activeTime: Array) - 新的时间范围                                           |
| outOfRange        | 拖拽超出范围     | { type: "min" \| "max", currentRange: number, minRange \| maxRange: number } |

### 使用示例

```vue
<template>
  <div>
    <drag-chart
      v-model:activeTime="activeTime"
      :timeRange="timeRange"
      :valueData="valueData"
      :maxRange="168"
      :minRange="1"
      :coverColor="'rgba(255,200,200,0.2)'"
      :lineColor="'#ff6b6b'"
      :needClick="true"
      @outOfRange="handleOutOfRange"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import dayjs from "dayjs";
import DragChart from "drag-chart";

const activeTime = ref([dayjs().subtract(6, "hours"), dayjs()]);
const timeRange = ref([dayjs().subtract(7, "days"), dayjs()]);
const valueData = ref([
  dayjs().subtract(5, "hours"),
  dayjs().subtract(3, "hours"),
  dayjs().subtract(1, "hours"),
]);

const handleOutOfRange = (params) => {
  console.log("超出范围:", params);
};
</script>
```

### 后续 组件迭代支持

- [x] 支持拖拽左右移动
- [ ] 改变时间之后, 判断之前 activeTIme 是否在 改变的时间范围内,
  - 在范围内 => 不变
  - activeTime[0]小于 rangeTime[0] => 则 activeTime 开始时间为 rangeTime 的开始
  - activeTime[0]大于 rangeTime[1] => activeTime = rangeTime
- [x] 支持自定义颜色(覆盖颜色, 边框颜色, 有数据的弧度) - 已完成，通过 coverColor 和 lineColor 控制
- [ ] 支持部分配置自定义
- [ ] x 轴的日期最好都显示出来
- [x] 支持最大/最小选择范围(多少 h) - 已完成，默认最大 168h，最小 3h
- [ ] 按需引入, 优化打包体积
- [x] 支持点击改变位置, 做成可配,默认开启 - 已完成，通过 needClick 控制
- [x] 支持超出范围事件回调 - 已完成，通过 outOfRange 事件
- [ ] 限制日期,目前为 7 天

### 目前已知 BUG

- [ ] 缩小到最小之后, 再次放大/缩小失效 - 已修复，现在支持配置最大最小范围

例子:
![Example](https://raw.githubusercontent.com/hanjituan/npm-package/main/image.png)

<!--

发布npm 包
参考: https://juejin.cn/post/7407637717206106163

pnpm create vite npm-package --template vue
在src\components文件创建文件夹button添加index.vue的文件, 封装我们要使用的组件
在src\components文件夹下新建index.js用于导出组件
在src\main.js注册组件 .use(DragChart)
在App.vue中使用此组件
在package.json中添加以下内容:
```json
{
  "name": "npm-package",
  "version": "1.0.0",
  "description": "A Vue component package",
  "main": "dist/index.js",
  "scripts": {
    "build": "vite build",
    "publish": "npm publish"
  },
  "dependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^2.0.0",
    "vite": "^2.0.0"
  }
}
```
在根目录下创建 README.md 文件, 添加组件的使用说明和参数说明
npm run build
npm publish
每次发布修改 package.json 的 version 字段

 -->
