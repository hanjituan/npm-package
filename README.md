# 📊 Drag Chart

一个基于 Vue 3 和 ECharts 的可拖拽时间范围选择图表组件，支持滚轮缩放、点击选择、范围限制等丰富功能。

[![npm version](https://badge.fury.io/js/drag-chart.svg)](https://badge.fury.io/js/drag-chart)
[![Vue 3](https://img.shields.io/badge/Vue-3-green.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🎯 **拖拽选择**: 支持鼠标拖拽调整时间范围
- 🔍 **滚轮缩放**: Ctrl+滚轮缩放，Shift+滚轮左右移动
- 👆 **点击选择**: 点击图表区域快速调整最近的拖拽点
- 🎨 **自定义样式**: 支持自定义颜色、图标等
- 📏 **范围限制**: 可配置最大最小选择范围
- 📊 **数据展示**: 支持显示有数据的时间段
- 🎛️ **灵活配置**: 丰富的配置选项，满足各种需求

## 📦 安装

```bash
npm install drag-chart
# 或
yarn add drag-chart
# 或
pnpm add drag-chart
```

## 🚀 快速开始

```vue
<template>
  <div style="width: 100%; height: 400px;">
    <drag-chart
      v-model:activeTime="activeTime"
      :timeRange="timeRange"
      :valueData="valueData"
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
</script>
```

## 📖 API 文档

### Props 参数

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

### 📡 事件

| 事件名            | 说明             | 回调参数                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| update:activeTime | 当前时间范围变化 | (activeTime: Array) - 新的时间范围                                           |
| outOfRange        | 拖拽超出范围     | { type: "min" \| "max", currentRange: number, minRange \| maxRange: number } |

### 🎮 使用示例

#### 基础用法

```vue
<template>
  <drag-chart v-model:activeTime="activeTime" :timeRange="timeRange" />
</template>
```

#### 自定义样式

```vue
<template>
  <drag-chart
    v-model:activeTime="activeTime"
    :timeRange="timeRange"
    :coverColor="'rgba(255,200,200,0.2)'"
    :lineColor="'#ff6b6b'"
    :symbolSize="24"
  />
</template>
```

#### 带数据展示

```vue
<template>
  <drag-chart
    v-model:activeTime="activeTime"
    :timeRange="timeRange"
    :valueData="valueData"
    :maxRange="168"
    :minRange="1"
  />
</template>
```

#### 完整示例

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

## 🎯 操作指南

### 鼠标操作

- **拖拽**: 直接拖拽左右两个拖拽点调整时间范围
- **点击**: 点击图表区域快速移动最近的拖拽点到点击位置
- **滚轮缩放**: `Ctrl + 滚轮` 进行缩放操作
- **水平移动**: `Shift + 滚轮` 进行水平移动

### 范围控制

- 可通过 `maxRange` 和 `minRange` 限制选择范围
- 当操作超出限制时，会触发 `outOfRange` 事件
- 自动边界检测，防止超出时间轴范围

## 🔧 配置项说明

### 时间格式

组件支持多种时间格式作为输入：

- `string`: "2024-01-01 12:00:00"
- `Date`: new Date()
- `dayjs.Dayjs`: dayjs()

### 自定义图标

可以使用本地图片或网络图片作为拖拽点图标：

```vue
<drag-chart
  :startIcon="'/path/to/start-icon.png'"
  :endIcon="'/path/to/end-icon.png'"
/>
```

## 🛠️ 开发计划

### ✅ 已完成功能

- ✅ 拖拽左右移动
- ✅ 最大/最小选择范围限制 (默认最大 168h，最小 3h)
- ✅ 点击修改位置 (通过 `needClick` 控制)
- ✅ 自定义颜色 (通过 `coverColor` 和 `lineColor` 控制)
- ✅ 超出范围事件回调 (通过 `outOfRange` 事件)

### 🚧 计划中功能

- [ ] **智能时间范围处理**
  - 时间范围变更时自动调整 `activeTime`
  - 边界自动适配逻辑
- [ ] **高级配置支持**
  - 更多样式配置选项
  - 主题预设系统
- [ ] **显示优化**
  - X 轴日期完整显示
  - 响应式布局优化
- [ ] **性能优化**
  - 按需引入，减少打包体积
  - 渲染性能优化
- [ ] **功能扩展**
  - 日期范围限制配置
  - 更多交互方式

## 🐛 已知问题

- ✅ ~~缩小到最小后无法继续操作~~ - 已修复，现在支持配置最大最小范围

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/hanjituan/npm-package.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 📄 许可证

[MIT](LICENSE) © 2025 hanjituan

## 🔗 相关链接

- [GitHub 仓库](https://github.com/hanjituan/npm-package)
- [NPM 包](https://www.npmjs.com/package/drag-chart)
- [问题反馈](https://github.com/hanjituan/npm-package/issues)
