import { Layout, PlotData } from 'plotly.js';

import { SetpointProfileBlock } from '@/plugins/spark/types';

export interface GraphProps {
  data: Partial<PlotData>[];
  layout: Partial<Layout>;
}

export const profileGraphProps = (block: SetpointProfileBlock): GraphProps => {
  const start = (block.data.start || 0) * 1000;
  const now = new Date().getTime();
  return {
    data: [
      {
        name: `${block.data.targetId.id || ''} setting`,
        type: 'scatter',
        x: block.data.points.map((p) => start + p.time * 1000),
        y: block.data.points.map((p) => p.temperature.value),
      },
    ],
    layout: {
      shapes: [
        {
          type: 'line',
          yref: 'paper',
          x0: now,
          x1: now,
          y0: 0,
          y1: 1,
          line: {
            color: 'rgb(0, 200, 0)',
            dash: 'dot',
          },
        },
      ],
    },
  };
};
