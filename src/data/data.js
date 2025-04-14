export const sampleLineData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 500 },
  { name: "May", value: 700 },
  { name: "Jun", value: 800 },
];
export const sampleBarData = [
  { name: "Cat A", uv: 4000, pv: 2400 },
  { name: "Cat B", uv: 3000, pv: 1398 },
  { name: "Cat C", uv: 2000, pv: 9800 },
  { name: "Cat D", uv: 2780, pv: 3908 },
  { name: "Cat E", uv: 1890, pv: 4800 },
];
export const sampleSparklineData = [
  { name: "P1", value: 10 },
  { name: "P2", value: 50 },
  { name: "P3", value: 30 },
  { name: "P4", value: 60 },
  { name: "P5", value: 40 },
  { name: "P6", value: 90 },
  { name: "P7", value: 70 },
];
export const sampleSpiralData = [
  { name: "1-2", value: 31.47, fill: "#8884d8" },
  { name: "2-3", value: 26.69, fill: "#83a6ed" },
  { name: "3-4", value: 15.69, fill: "#8dd1e1" },
  { name: "4-5", value: 8.22, fill: "#82ca9d" },
  { name: "5-6", value: 8.63, fill: "#a4de6c" },
  { name: "6-7", value: 2.63, fill: "#d0ed57" },
  { name: ">7", value: 6.67, fill: "#ffc658" },
];

export const defaultInitialLayout = [
  {
    i: "1",
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    isDraggable: true,
    isResizable: true,
    content: { type: "text", text: "Welcome!", title: "Welcome Block" },
  },
];
