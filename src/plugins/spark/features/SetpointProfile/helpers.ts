import { durationMs, parseDate } from '@/utils/quantity';
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { Layout, PlotData } from 'plotly.js';

export interface GraphProps {
  data: Partial<PlotData>[];
  layout: Partial<Layout>;
}

export const profileGraphProps = (block: SetpointProfileBlock): GraphProps => {
  const start = parseDate(block.data.start)?.getTime() ?? 0;
  const now = new Date().getTime();
  return {
    data: [
      {
        name: `${block.data.targetId.id || ''} setting`,
        type: 'scattergl',
        x: block.data.points.map((p) => start + durationMs(p.time)),
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
