import DragChart from "./drag-chart.vue";
export { DragChart };

const components = [DragChart];

const install = (app) => {
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

export default { install };
