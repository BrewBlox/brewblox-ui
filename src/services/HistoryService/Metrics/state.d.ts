export type MetricsOptions = {
  id: string;
  order: number;
  path: string;
};

export type MeasuresType = {
  [key: string]: string[];
};

type PlotlyData = {
  type: string,
  x: number[],
  y: number[],
};

type PlotlyOptions = {
  data: PlotlyData[],
  layout: {
    title: string,
    yaxis?: {
      title?: string,
    },
  },
};
