import DragChart from "./drag-chart.vue";
export { DragChart };

const components = [DragChart];

const install = (app) => {
  components.forEach((component) => {
    console.log(component);

    app.component(component.name, component);
  });
};

export default { install };
