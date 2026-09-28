<script setup lang="ts">
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import Plotly, {
  ClickAnnotationEvent,
  Config,
  Layout,
  PlotData,
  PlotlyHTMLElement,
  PlotMouseEvent,
  PlotRelayoutEvent,
} from 'plotly.js';
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Y2_COLOR } from '@/plugins/history/const';
import { GraphAnnotation } from '@/plugins/history/types';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import { GraphDataKey } from './symbols';
import {
  emptyGraphView,
  GraphRange,
  GraphView,
  parsePlotlyRange,
  relayoutView,
  viewAxis,
  viewRange,
} from './view';

interface Props {
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  annotated?: boolean;
  revision?: Date;
  static?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  layout: () => ({}),
  config: () => ({}),
  annotated: false,
  revision: () => new Date(),
  static: false,
});

const emit = defineEmits<{
  annotations: [payload: GraphAnnotation[]];
}>();

// What the x axis shows. It is updated after a zoom, pan or reset in the graph.
// Parents that do not bind it get a view that lasts as long as this component.
const view = defineModel<GraphView>('view', { default: emptyGraphView });

// Plotly.react keeps zoom, pan and legend edits made in the graph
// as long as uirevision stays the same (compared with ===)
const UI_REVISION = 'graph';
const STATIC_REVISION = 'static';

const layoutDefaults = (): Partial<Layout> => ({
  title: '',
  font: {
    color: '#fff',
  },
  margin: {
    t: 40,
    l: 40,
    r: 0,
    b: 40,
  },
  legend: { orientation: 'h' },
  showlegend: true,
  xaxis: {
    type: 'date',
    gridcolor: '#666',
    autorange: true,
  },
  yaxis: {
    side: 'right',
    gridcolor: '#666',
    zerolinecolor: '#eee',
    autorange: true,
  },
  yaxis2: {
    overlaying: 'y',
    side: 'right',
    position: 0.95,
    gridcolor: '#467',
    zerolinecolor: Y2_COLOR,
    autorange: true,
    tickfont: {
      color: Y2_COLOR,
    },
  },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  hovermode: 'closest',
});

const plotlyElement = ref<PlotlyHTMLElement>();
const containerSize = ref<AreaSize>({ width: 200, height: 200 });
const graphData = inject(GraphDataKey)!;

if (!graphData) {
  throw new Error('No graph data ref injected');
}

const annotations = computed<GraphAnnotation[]>(
  () => props.layout.annotations ?? [],
);

const layoutSize = computed<AreaSize>(() => ({
  width: props.layout.width ?? 0,
  height: props.layout.height ?? 0,
}));

function calcSize(): AreaSize {
  const lsize = layoutSize.value;
  const csize = containerSize.value;

  return {
    width: lsize.width || csize.width || 200,
    height: lsize.height || csize.height || 200,
  };
}

function combinedConfig(): Partial<Config> {
  return merge<Partial<Config>, Partial<Config>>(
    {
      displaylogo: false,
      responsive: true,
      staticPlot: props.static,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      modeBarButtonsToAdd: [
        {
          name: 'toImageLargeJpeg',
          title: 'Download plot as a jpeg',
          icon: Plotly['Icons'].camera,
          click: (el) =>
            Plotly.downloadImage(el, {
              format: 'jpeg',
              width: 3000,
              height: 1500,
              filename: (get(props.layout, 'title.text', props.layout.title) ||
                'graph') as string,
            }),
        },
        {
          name: 'toImageLargePng',
          title: 'Download plot as a png',
          icon: Plotly['Icons'].camera,
          click: (el) =>
            Plotly.downloadImage(el, {
              format: 'png',
              width: 3000,
              height: 1500,
              filename: (get(props.layout, 'title.text', props.layout.title) ||
                'graph') as string,
            }),
        },
      ],
    },
    props.config,
  );
}

function combinedLayout(range: GraphRange | null): Partial<Layout> {
  return merge<
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>
  >(
    layoutDefaults(),
    props.layout,
    { ...calcSize(), uirevision: UI_REVISION, xaxis: viewAxis(range) },
    // A static plot cannot be reset: another revision drops a zoom made before
    props.static
      ? {
          dragmode: false,
          hovermode: false,
          xaxis: { uirevision: STATIC_REVISION },
          yaxis: { uirevision: STATIC_REVISION },
          yaxis2: { uirevision: STATIC_REVISION },
        }
      : {},
    graphData.value.some((d) => d.yaxis === 'y2')
      ? { xaxis: { domain: [0, 0.89] }, yaxis: { position: 0.9 } }
      : { xaxis: { domain: [0, 0.94] }, yaxis: { position: 0.95 } },
  );
}

function displayError(msg: string): void {
  notify.warn(`Failed to render graph: ${msg}`);
}

// Plotly gets new copies of the traces for every render.
// It writes edits made in the graph, such as a legend click, into the traces it gets,
// and keeps them across renders only while the traces it gets do not carry them:
// the same objects again would, and the edit would be lost with the next copies.
function plotTraces(): Partial<PlotData>[] {
  return graphData.value.map((trace) => ({ ...trace }));
}

async function reactPlot(): Promise<void> {
  await Plotly.react(
    plotlyElement.value!,
    plotTraces(),
    // A static plot cannot be zoomed, nor reset: it shows all data
    combinedLayout(
      props.static ? null : viewRange(view.value, graphData.value),
    ),
    combinedConfig(),
  );
}

async function createPlot(): Promise<void> {
  if (!plotlyElement.value) {
    return;
  }
  try {
    // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
    // A double click returns to the x range the plot was created with.
    // The plot is created with autorange, so a double click shows all data.
    await Plotly.newPlot(
      plotlyElement.value,
      plotTraces(),
      combinedLayout(null),
      combinedConfig(),
    );
    plotlyElement.value.on('plotly_relayout', onRelayout);
    plotlyElement.value.on('plotly_click', onClick);
    plotlyElement.value.on('plotly_clickannotation', onAnnotationClick);
    if (view.value.range != null && !props.static) {
      await reactPlot();
    }
  } catch (e: any) {
    displayError(e.message);
  }
}

// Every render goes through Plotly.react, with the current data and layout.
// Plotly.relayout would reset the zoom (the layout defaults autorange),
// and would emit plotly_relayout for our own changes.
async function renderPlot(): Promise<void> {
  if (!plotlyElement.value) {
    return;
  }
  try {
    await reactPlot();
  } catch (e: any) {
    displayError(e.message);
  }
}

function onClick(evt: PlotMouseEvent): void {
  if (!props.annotated || !evt.points.length) {
    return;
  }

  const point = evt.points[0];
  createDialog({
    component: 'TextDialog',
    componentProps: {
      modelValue: 'New annotation',
      title: 'Add annotation',
    },
  }).onOk((text: string) => {
    const a: GraphAnnotation = {
      x: point.x as string,
      y: parseFloat((point.y as number).toPrecision(4)),
      xref: 'x',
      yref: point.data.yaxis as 'y',
      text,
      visible: true,
      arrowhead: 7,
      arrowcolor: 'white',
      captureevents: true,
    };
    emit('annotations', [...annotations.value, a]);
  });
}

function onAnnotationClick(evt: ClickAnnotationEvent): void {
  if (!props.annotated || annotations.value.length < evt.index) {
    return;
  }

  const annotation = annotations.value[evt.index];
  createDialog({
    component: 'GraphAnnotationDialog',
    componentProps: {
      title: 'Edit annotation',
      modelValue: annotation.text ?? '',
    },
  }).onOk(({ text, remove }: { text: string; remove: boolean }) => {
    const updated = [...annotations.value];
    remove
      ? updated.splice(evt.index, 1)
      : updated.splice(evt.index, 1, { ...annotation, text });
    emit('annotations', updated);
  });
}

// Only zoom, pan and reset in the graph change the view.
// Plotly.react does not emit plotly_relayout, so renders do not.
function onRelayout(event: PlotRelayoutEvent): void {
  const shown = parsePlotlyRange(plotlyElement.value?.layout.xaxis?.range);
  const updated = relayoutView(event as Mapped<unknown>, shown);
  if (updated != null && !isEqual(updated, view.value)) {
    view.value = updated;
  }
}

const debouncedRender = debounce(renderPlot, 50);

watch(
  () => [props.config, props.revision, graphData.value, view.value],
  () => debouncedRender(),
);

watch(
  () => props.layout,
  () => debouncedRender(),
  { deep: true },
);

onMounted(() => {
  createPlot();
  window.addEventListener('resize', debouncedRender);
  window.addEventListener('orientationchange', debouncedRender);
});

onBeforeUnmount(() => {
  debouncedRender.cancel();
  window.removeEventListener('resize', debouncedRender);
  window.removeEventListener('orientationchange', debouncedRender);
  Plotly.purge(plotlyElement.value!);
});
</script>

<template>
  <div ref="containerElement">
    <q-resize-observer
      :debounce="200"
      @resize="
        (v) => {
          containerSize = v;
          debouncedRender();
        }
      "
    />
    <div ref="plotlyElement" />
  </div>
</template>

<style lang="sass">
.plotly
  .modebar
    left: 0px
  .modebar-group
    background: transparent !important
  .modebar-btn path
    fill: rgba(255, 255, 255, 0.6)
  .modebar-btn.active path, .modebar-btn:hover path
    fill: rgba(255, 255, 255, 1)

.xy2
  color: green

// Plotly's tips after a zoom or a legend click sit at the top right of the window,
// over graph controls there, and would take their clicks
.plotly-notifier
  pointer-events: none
</style>
