export const getDefaultTitle = (type, options = {}) => {
  switch (type) {
    case "text":
      return "Text Block";
    case "image":
      return "Image";
    case "chart":
      switch (options.chartType) {
        case "line":
          return "Line Chart";
        case "bar":
          return "Bar Chart";
        case "sparkline":
          return "Sparkline";
        case "spiral":
          return "Spiral Chart";
        default:
          return "Chart";
      }
    default:
      return "New Block";
  }
};

export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
