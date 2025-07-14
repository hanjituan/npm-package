import { getCurrentScope as K, onScopeDispose as N, computed as x, toValue as I, watch as Y, shallowRef as V, getCurrentInstance as X, onMounted as F, defineComponent as B, ref as A, onBeforeUnmount as $, createElementBlock as j, openBlock as G, createElementVNode as U } from "vue";
import p from "dayjs";
import * as q from "echarts";
function J(i) {
  return K() ? (N(i), !0) : !1;
}
const Q = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
const ee = Q ? window : void 0;
function L(i) {
  var l;
  const t = I(i);
  return (l = t?.$el) != null ? l : t;
}
function te() {
  const i = V(!1), l = X();
  return l && F(() => {
    i.value = !0;
  }, l), i;
}
function ne(i) {
  const l = te();
  return x(() => (l.value, !!i()));
}
function oe(i, l, t = {}) {
  const { window: h = ee, ...v } = t;
  let r;
  const n = ne(() => h && "ResizeObserver" in h), _ = () => {
    r && (r.disconnect(), r = void 0);
  }, c = x(() => {
    const g = I(i);
    return Array.isArray(g) ? g.map((y) => L(y)) : [L(g)];
  }), b = Y(
    c,
    (g) => {
      if (_(), n.value && h) {
        r = new ResizeObserver(l);
        for (const y of g)
          y && r.observe(y, v);
      }
    },
    { immediate: !0, flush: "post" }
  ), S = () => {
    _(), b();
  };
  return J(S), {
    isSupported: n,
    stop: S
  };
}
const ae = { class: "chart-container" }, re = B({
  name: "DragChart"
}), ie = /* @__PURE__ */ B({
  ...re,
  props: {
    // x轴的开始和结束时间
    timeRange: {
      type: Array,
      default: () => [p(), p()]
    },
    // 开始图标
    startIcon: {
      type: String,
      default: "https://img.icons8.com/material-outlined/24/000000/left2.png"
    },
    // 结束图标
    endIcon: {
      type: String,
      default: "https://img.icons8.com/material-outlined/24/000000/right2.png"
    },
    // 拖拽点的大小
    symbolSize: {
      type: Number,
      default: 20
    },
    // 目前是有值的柱子
    valueData: {
      type: Array,
      default: () => []
    },
    // 当前时间范围
    activeTime: {
      type: Array,
      default: () => [0, 12]
    },
    // X轴的间隔
    interval: {
      type: Number,
      default: 4
    },
    autoInterval: {
      type: Boolean,
      default: !0
    }
  },
  emits: ["update:activeTime"],
  setup(i, { emit: l }) {
    const t = i, h = l, v = A();
    let r;
    const n = A([
      [10, 0],
      [20, 0]
    ]);
    oe(v, () => {
      r && r.resize({
        width: "auto",
        height: "auto"
      });
    });
    const c = x(() => 24 * t.timeRange.length - 1), b = x(() => {
      const e = [], o = p(t.timeRange[0]), u = p(t.timeRange[t.timeRange.length - 1]).diff(o, "day");
      for (let m = 0; m <= u; m++) {
        const f = o.add(m, "day");
        for (let s = 0; s < 24; s++)
          e.push(f.hour(s).format("YYYY-MM-DD HH:mm:ss"));
      }
      return e;
    }), S = x(() => Math.floor((c.value - 1) / 12) + 1), g = x(() => !t.valueData || t.valueData.length === 0 ? [] : t.valueData.reduce((o, a) => {
      const u = o[o.length - 1];
      return u && p(u).hour() === p(a).hour() ? o : [
        ...o,
        p(a).set("minute", 0).set("second", 0).format("YYYY-MM-DD HH:mm:ss")
      ];
    }, [])), y = (e, o) => {
      const a = [];
      for (let u = e; u <= o; u += 1)
        a.push([u, 2]);
      return a;
    }, w = () => {
      r.setOption({
        graphic: n.value.map((e) => ({
          position: r.convertToPixel("grid", e)
        }))
      });
    }, P = (e) => {
      r.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: e
      });
    }, H = () => {
      r.dispatchAction({
        type: "hideTip"
      });
    }, M = () => {
      const e = Math.min(n.value[0][0], n.value[1][0]), o = Math.max(n.value[0][0], n.value[1][0]), a = y(e, o), u = n.value[0][0], m = n.value[1][0], f = u < m;
      r.setOption({
        series: [
          {
            id: "a",
            data: n.value,
            z: 80,
            silent: !0,
            animation: !1,
            symbolSize: 20
            // TODO: 待确认
          },
          {
            id: "b",
            data: a,
            type: "line",
            areaStyle: {
              color: "rgba(160,210,255,0.14)"
            },
            symbolSize: 0,
            markLine: C(a),
            z: 90,
            silent: !0,
            animation: !1
          }
        ]
      }), r.setOption({
        graphic: n.value.map((s, d) => ({
          position: r.convertToPixel("grid", s),
          type: "image",
          style: {
            image: (f ? d === 0 : d === 1) ? t.startIcon : t.endIcon,
            width: t.symbolSize,
            height: t.symbolSize,
            x: -t.symbolSize / 2,
            y: -t.symbolSize / 2
          },
          invisible: !1,
          z: 100
        }))
      });
    }, R = () => {
      h(
        "update:activeTime",
        n.value.map((e) => b.value[e[0]])
      );
    }, W = (e, o) => {
      const a = r.convertFromPixel("grid", o);
      a[0] = Math.round(Math.min(Math.max(a[0], 0), c.value)), a[1] = n.value[e][1], n.value[e] = a, M(), R();
    }, Z = (e, o) => {
      const a = r.convertFromPixel("grid", o);
      a[0] = Math.min(Math.max(a[0], 0), c.value), a[1] = n.value[e][1], n.value[e] = a, M();
    }, T = (e) => {
      if (!e.ctrlKey && !e.shiftKey) return;
      e.preventDefault();
      const o = e.deltaY, a = Math.abs(n.value[1][0] - n.value[0][0]);
      if (e.shiftKey) {
        const O = o > 0 ? 2 : -2;
        let D = n.value[0][0] + O, z = n.value[1][0] + O;
        D < 0 && (D = 0, z = a), z > c.value && (z = c.value, D = c.value - a), n.value = [
          [D, 0],
          [z, 0]
        ], M(), R();
        return;
      }
      const u = 0.1;
      if (a <= 4 && o > 0) return;
      let m = o > 0 ? Math.min(c.value, a * (1 + u)) : Math.max(4, a * (1 - u));
      const f = (n.value[0][0] + n.value[1][0]) / 2;
      let s = Math.round(f - m / 2), d = Math.round(f + m / 2);
      s < 0 && (s = 0, d = Math.min(c.value, Math.round(m))), d > c.value && (d = c.value, s = Math.max(0, Math.round(c.value - m))), !(d - s < 4) && (n.value = [
        [s, 0],
        [d, 0]
      ], M(), R());
    }, k = () => {
      const e = Math.min(n.value[0][0], n.value[1][0]), o = Math.max(n.value[0][0], n.value[1][0]), a = y(e, o), u = g.value.map(
        (f) => [b.value.findIndex(
          (d) => p(d).isSame(p(f), "hour")
        ), 1]
      ), m = [
        {
          id: "b",
          type: "line",
          data: a,
          areaStyle: {
            color: "rgba(160,210,255,0.14)"
          },
          lineStyle: {
            color: "#5CB0FE",
            width: 1
          },
          symbol: "none",
          markLine: C(a),
          z: 100,
          silent: !0,
          animation: !1
        },
        {
          id: "c",
          type: "bar",
          data: u,
          barWidth: 20,
          itemStyle: {
            color: "#C2E2FF",
            borderRadius: [3, 3, 0, 0]
          },
          z: 0,
          silent: !0,
          animation: !1
        }
      ];
      return {
        tooltip: {
          triggerOn: "none",
          formatter: function(f) {
            const s = b.value[Math.round(f.data[0])];
            return p(s).format("MM/DD HH:mm");
          }
        },
        grid: {
          top: "50%",
          left: "17",
          right: "20"
        },
        xAxis: {
          min: 0,
          max: c.value,
          interval: t.autoInterval ? S.value : t.interval,
          type: "value",
          axisLine: { onZero: !1 },
          axisTick: { inside: !0 },
          splitLine: { show: !1 },
          axisLabel: {
            formatter: function(f) {
              let s = b.value[f];
              const d = p(s).hour();
              return d == 0 ? `{datebox|}{date|${p(s).format("MM/DD")}}` : `{time|${d}:00}`;
            },
            rich: {
              datebox: {
                width: 40
              },
              date: {
                color: "#333333",
                backgroundColor: "rgba(51,51,51,0.08)",
                padding: 4,
                borderRadius: 10
              },
              time: {
                color: "#666"
              }
            }
          }
        },
        yAxis: {
          type: "value",
          axisLine: { show: !1 },
          axisLabel: { show: !1 },
          axisTick: { show: !1 },
          splitLine: { show: !1 }
        },
        series: [
          {
            id: "a",
            type: "line",
            smooth: !0,
            data: n.value,
            areaStyle: {},
            symbolSize: 20
            // TODO: 待确认 // props.symbolSize,
          },
          ...m
        ]
      };
    }, C = (e) => ({
      symbol: "none",
      animation: !1,
      z: 0,
      lineStyle: {
        color: "#5CB0FE",
        width: 1,
        type: "solid"
      },
      data: [
        // 左侧竖线
        [
          { coord: [e[0][0], 0] },
          { coord: [e[0][0], e[0][1]] }
        ],
        // 右侧竖线
        [
          { coord: [e[e.length - 1][0], 0] },
          {
            coord: [
              e[e.length - 1][0],
              e[e.length - 1][1]
            ]
          }
        ]
        // 底部横线
        // [
        //   { coord: [initialPoints[0][0], 0] },
        //   { coord: [initialPoints[initialPoints.length - 1][0], 0] },
        // ],
      ]
    }), E = (e) => {
      const o = [e.offsetX, e.offsetY];
      r.convertFromPixel(
        { seriesIndex: 0 },
        o
      );
    };
    return F(() => {
      r = q.init(v.value, null, {
        renderer: "svg"
      }), r.setOption(k()), setTimeout(() => {
        r.setOption({
          graphic: n.value.map((e, o) => ({
            type: "image",
            position: r.convertToPixel("grid", e),
            style: {
              image: o === 0 ? t.startIcon : t.endIcon,
              width: t.symbolSize,
              height: t.symbolSize,
              x: -t.symbolSize / 2,
              y: -t.symbolSize / 2
            },
            invisible: !1,
            draggable: "horizontal",
            ondrag: function(a, u) {
              Z(o, [this.x, this.y]);
            },
            ondragend: function() {
              W(o, [this.x, this.y]);
            },
            onmousemove: function() {
              P(o);
            },
            onmouseout: function() {
              H();
            },
            z: 200
          }))
        });
      }, 0), window.addEventListener("resize", w), r.on("dataZoom", w), r.getZr().on("click", E), v.value.addEventListener("wheel", T, { passive: !1 });
    }), $(() => {
      window.removeEventListener("resize", w), r.off("dataZoom", w), r.getZr().off("click", E), v.value?.removeEventListener("wheel", T);
    }), Y(
      () => t.timeRange,
      (e) => {
        r && (r.setOption(k()), w());
      },
      { immediate: !0 }
    ), (e, o) => (G(), j("div", ae, [
      U("div", {
        ref_key: "chartRef",
        ref: v,
        class: "chart-wrap"
      }, null, 512)
    ]));
  }
}), se = (i, l) => {
  const t = i.__vccOpts || i;
  for (const [h, v] of l)
    t[h] = v;
  return t;
}, le = /* @__PURE__ */ se(ie, [["__scopeId", "data-v-eb36b0a0"]]), ue = [le], ce = (i) => {
  ue.forEach((l) => {
    i.component(l.name, l);
  });
}, pe = { install: ce };
export {
  le as DragChart,
  pe as default
};
