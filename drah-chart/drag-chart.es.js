import { getCurrentScope as G, onScopeDispose as K, computed as b, toValue as L, watch as Y, shallowRef as N, getCurrentInstance as V, onMounted as F, defineComponent as B, ref as X, onBeforeUnmount as $, createElementBlock as j, openBlock as U, createElementVNode as q } from "vue";
import c from "dayjs";
import * as J from "echarts";
function Q(i) {
  return G() ? (K(i), !0) : !1;
}
const ee = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
const te = ee ? window : void 0;
function A(i) {
  var l;
  const t = L(i);
  return (l = t?.$el) != null ? l : t;
}
function ne() {
  const i = N(!1), l = V();
  return l && F(() => {
    i.value = !0;
  }, l), i;
}
function oe(i) {
  const l = ne();
  return b(() => (l.value, !!i()));
}
function ae(i, l, t = {}) {
  const { window: g = te, ...h } = t;
  let r;
  const d = oe(() => g && "ResizeObserver" in g), p = () => {
    r && (r.disconnect(), r = void 0);
  }, o = b(() => {
    const y = L(i);
    return Array.isArray(y) ? y.map((x) => A(x)) : [A(y)];
  }), z = Y(
    o,
    (y) => {
      if (p(), d.value && g) {
        r = new ResizeObserver(l);
        for (const x of y)
          x && r.observe(x, h);
      }
    },
    { immediate: !0, flush: "post" }
  ), T = () => {
    p(), z();
  };
  return Q(T), {
    isSupported: d,
    stop: T
  };
}
const re = { class: "chart-container" }, ie = B({
  name: "DragChart"
}), se = /* @__PURE__ */ B({
  ...ie,
  props: {
    // x轴的开始和结束时间
    timeRange: {
      type: Array,
      default: () => [c().subtract(1, "day"), c()]
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
    const t = i, g = l, h = X();
    let r;
    const d = b(() => 24 * t.timeRange.length - 1), p = b(() => {
      const e = [], a = c(t.timeRange[0]), u = c(t.timeRange[t.timeRange.length - 1]).diff(a, "day");
      for (let f = 0; f <= u; f++) {
        const v = a.add(f, "day");
        for (let s = 0; s < 24; s++)
          e.push(v.hour(s).format("YYYY-MM-DD HH:00:00"));
      }
      return e;
    }), o = b({
      get() {
        return z();
      },
      set(e) {
        g("update:activeTime", e);
      }
    }), z = () => {
      if (!t.activeTime || t.activeTime.length !== 2)
        return [
          [0, 0],
          [p.value.length - 1, 0]
        ];
      const e = p.value.findIndex(
        (n) => c(n).isSame(c(t.activeTime[0]), "hour")
      ), a = p.value.findIndex(
        (n) => c(n).isSame(c(t.activeTime[1]), "hour")
      );
      return [
        [e, 0],
        [a, 0]
      ];
    };
    ae(h, () => {
      r && r.resize({
        width: "auto",
        height: "auto"
      });
    });
    const y = b(() => Math.floor((d.value - 1) / 12) + 1), x = b(() => !t.valueData || t.valueData.length === 0 ? [] : t.valueData.reduce((a, n) => {
      const u = a[a.length - 1];
      return u && c(u).hour() === c(n).hour() ? a : [
        ...a,
        c(n).set("minute", 0).set("second", 0).format("YYYY-MM-DD HH:mm:ss")
      ];
    }, [])), R = (e, a) => {
      const n = [];
      for (let u = e; u <= a; u += 1)
        n.push([u, 2]);
      return n;
    }, w = () => {
      r.setOption({
        graphic: o.value.map((e) => ({
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
    }, S = () => {
      const e = Math.min(o.value[0][0], o.value[1][0]), a = Math.max(o.value[0][0], o.value[1][0]), n = R(e, a), u = o.value[0][0], f = o.value[1][0], v = u < f;
      r.setOption({
        series: [
          {
            id: "a",
            data: o.value,
            z: 80,
            silent: !0,
            animation: !1,
            symbolSize: 20
            // TODO: 待确认
          },
          {
            id: "b",
            data: n,
            type: "line",
            areaStyle: {
              color: "rgba(160,210,255,0.14)"
            },
            symbolSize: 0,
            markLine: E(n),
            z: 90,
            silent: !0,
            animation: !1
          }
        ]
      }), r.setOption({
        graphic: o.value.map((s, m) => ({
          position: r.convertToPixel("grid", s),
          type: "image",
          style: {
            image: (v ? m === 0 : m === 1) ? t.startIcon : t.endIcon,
            width: t.symbolSize,
            height: t.symbolSize,
            x: -t.symbolSize / 2,
            y: -t.symbolSize / 2
          },
          invisible: !1,
          z: 100
        }))
      });
    }, _ = () => {
      g(
        "update:activeTime",
        o.value.map((e) => p.value[e[0]])
      );
    }, W = (e, a) => {
      const n = r.convertFromPixel("grid", a);
      n[0] = Math.round(Math.min(Math.max(n[0], 0), d.value)), n[1] = o.value[e][1], o.value[e] = n, S(), _();
    }, Z = (e, a) => {
      const n = r.convertFromPixel("grid", a);
      n[0] = Math.min(Math.max(n[0], 0), d.value), n[1] = o.value[e][1], o.value[e] = n, S();
    }, k = (e) => {
      if (!e.ctrlKey && !e.shiftKey) return;
      e.preventDefault();
      const a = e.deltaY, n = Math.abs(o.value[1][0] - o.value[0][0]);
      if (e.shiftKey) {
        const O = a > 0 ? 2 : -2;
        let M = o.value[0][0] + O, D = o.value[1][0] + O;
        M < 0 && (M = 0, D = n), D > d.value && (D = d.value, M = d.value - n), o.value[0] = [M, 0], o.value[1] = [D, 0], S(), _();
        return;
      }
      const u = 0.1;
      if (n <= 4 && a > 0) return;
      let f = a > 0 ? Math.min(d.value, n * (1 + u)) : Math.max(4, n * (1 - u));
      const v = (o.value[0][0] + o.value[1][0]) / 2;
      let s = Math.round(v - f / 2), m = Math.round(v + f / 2);
      s < 0 && (s = 0, m = Math.min(d.value, Math.round(f))), m > d.value && (m = d.value, s = Math.max(0, Math.round(d.value - f))), !(m - s < 4) && (o.value[0] = [s, 0], o.value[1] = [m, 0], S(), _());
    }, C = () => {
      const e = Math.min(o.value[0][0], o.value[1][0]), a = Math.max(o.value[0][0], o.value[1][0]), n = R(e, a), u = x.value.map(
        (v) => [p.value.findIndex(
          (m) => c(m).isSame(c(v), "hour")
        ), 1]
      ), f = [
        {
          id: "b",
          type: "line",
          data: n,
          areaStyle: {
            color: "rgba(160,210,255,0.14)"
          },
          lineStyle: {
            color: "#5CB0FE",
            width: 1
          },
          symbol: "none",
          markLine: E(n),
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
          formatter: function(v) {
            const s = p.value[Math.round(v.data[0])];
            return c(s).format("MM/DD HH:mm");
          }
        },
        grid: {
          top: "50%",
          left: "50",
          right: "50"
        },
        xAxis: {
          min: 0,
          max: d.value,
          interval: t.autoInterval ? y.value : t.interval,
          type: "value",
          // boundaryGap: "0%",
          boundaryGap: ["0%", "100%"],
          axisLine: { onZero: !1 },
          axisTick: { inside: !0 },
          splitLine: { show: !1 },
          axisLabel: {
            formatter: function(v) {
              let s = p.value[v];
              const m = c(s).hour();
              return m == 0 ? `{datebox|}{date|${c(s).format("MM/DD")}}` : `{time|${m}:00}`;
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
            data: o.value,
            areaStyle: {},
            symbolSize: 20
            // TODO: 待确认 // props.symbolSize,
          },
          ...f
        ]
      };
    }, E = (e) => ({
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
    }), I = (e) => {
      const a = [e.offsetX, e.offsetY];
      r.convertFromPixel(
        { seriesIndex: 0 },
        a
      );
    };
    return F(() => {
      r = J.init(h.value, null, {
        renderer: "svg"
      }), r.setOption(C()), setTimeout(() => {
        r.setOption({
          graphic: o.value.map((e, a) => ({
            type: "image",
            position: r.convertToPixel("grid", e),
            style: {
              image: a === 0 ? t.startIcon : t.endIcon,
              width: t.symbolSize,
              height: t.symbolSize,
              x: -t.symbolSize / 2,
              y: -t.symbolSize / 2
            },
            invisible: !1,
            draggable: "horizontal",
            ondrag: function(n, u) {
              Z(a, [this.x, this.y]);
            },
            ondragend: function() {
              W(a, [this.x, this.y]);
            },
            onmousemove: function() {
              P(a);
            },
            onmouseout: function() {
              H();
            },
            z: 200
          }))
        });
      }, 0), window.addEventListener("resize", w), r.on("dataZoom", w), r.getZr().on("click", I), h.value.addEventListener("wheel", k, { passive: !1 });
    }), $(() => {
      window.removeEventListener("resize", w), r.off("dataZoom", w), r.getZr().off("click", I), h.value?.removeEventListener("wheel", k);
    }), Y(
      () => t.timeRange,
      (e) => {
        r && (r.setOption(C()), w());
      },
      { immediate: !0 }
    ), (e, a) => (U(), j("div", re, [
      q("div", {
        ref_key: "chartRef",
        ref: h,
        class: "chart-wrap"
      }, null, 512)
    ]));
  }
}), le = (i, l) => {
  const t = i.__vccOpts || i;
  for (const [g, h] of l)
    t[g] = h;
  return t;
}, ue = /* @__PURE__ */ le(se, [["__scopeId", "data-v-ec1e5d9c"]]), ce = [ue], de = (i) => {
  ce.forEach((l) => {
    i.component(l.name, l);
  });
}, pe = { install: de };
export {
  ue as DragChart,
  pe as default
};
