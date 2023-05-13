<script setup lang="ts">
import { Y2_COLOR } from '@/plugins/history/const';
import { GraphAnnotation } from '@/plugins/history/types';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import merge from 'lodash/merge';
import Plotly, {
  ClickAnnotationEvent,
  Config,
  Layout,
  PlotData,
  PlotlyHTMLElement,
  PlotMouseEvent,
} from 'plotly.js';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

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
    domain: [0, 0.9],
  },
  yaxis: {
    side: 'right',
    position: 0.9,
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

const props = defineProps({
  data: {
    type: Array as PropType<Partial<PlotData>[]>,
    default: () => [],
  },
  layout: {
    type: Object as PropType<Partial<Layout>>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<Partial<Config>>,
    default: () => ({}),
  },
  annotated: {
    type: Boolean,
    default: false,
  },
  maximized: {
    type: Boolean,
    default: false,
  },
  autoResize: {
    type: Boolean,
    default: false,
  },
  revision: {
    type: Date,
    default: () => new Date(),
  },
  static: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'annotations', data: GraphAnnotation[]);
}>();

const plotlyElement = ref<PlotlyHTMLElement>();
const containerSize = ref<AreaSize>({ width: 200, height: 200 });

let zoomed = false;
let skippedRender = false;

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

function combinedLayout(): Partial<Layout> {
  return merge<
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>,
    Partial<Layout>
  >(
    layoutDefaults(),
    props.layout,
    calcSize(),
    props.static ? { dragmode: false, hovermode: false } : {},
    props.data.some((d) => d.yaxis === 'y2')
      ? { xaxis: { domain: [0, 0.89] }, yaxis: { position: 0.9 } }
      : { xaxis: { domain: [0, 0.94] }, yaxis: { position: 0.95 } },
  );
}

function displayError(msg: string): void {
  notify.warn(`Failed to render graph: ${msg}`);
}

async function relayoutPlot(): Promise<void> {
  await Plotly.relayout(plotlyElement.value!, combinedLayout());
}

async function reactPlot(): Promise<void> {
  await Plotly.react(
    plotlyElement.value!,
    props.data,
    combinedLayout(),
    combinedConfig(),
  );
}

async function createPlot(): Promise<void> {
  if (!plotlyElement.value) {
    return;
  }
  try {
    // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
    await Plotly.newPlot(
      plotlyElement.value,
      props.data,
      combinedLayout(),
      combinedConfig(),
    );
    plotlyElement.value.on('plotly_relayout', onRelayout);
    plotlyElement.value.on('plotly_click', onClick);
    plotlyElement.value.on('plotly_doubleclick', onDoubleClick);
    plotlyElement.value.on('plotly_clickannotation', onAnnotationClick);
  } catch (e: any) {
    displayError(e.message);
  }
}

async function renderPlot(layoutChanged: boolean): Promise<void> {
  if (!plotlyElement.value) {
    return;
  }
  if (zoomed) {
    skippedRender = true;
    return;
  }
  try {
    layoutChanged ? await relayoutPlot() : await reactPlot();
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
    component: 'InputDialog',
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

function onDoubleClick(): void {
  zoomed = false;
  if (skippedRender) {
    skippedRender = false;
    renderPlot(false);
  }
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
      modelValue: annotation.text,
    },
  }).onOk(({ text, remove }: { text: string; remove: boolean }) => {
    const updated = [...annotations.value];
    remove
      ? updated.splice(evt.index, 1)
      : updated.splice(evt.index, 1, { ...annotation, text });
    emit('annotations', updated);
  });
}

function onRelayout(eventdata: Mapped<any>): void {
  if (eventdata['xaxis.range[0]'] || eventdata['xaxis.range[1]']) {
    zoomed = true;
  }
}

const debouncedRender = debounce(renderPlot, 50);
const debouncedRelayout = debounce(relayoutPlot, 100);

watch(
  () => [props.config, props.data, props.revision],
  () => debouncedRender(false),
);

watch(
  () => props.layout,
  () => debouncedRender(true),
  { deep: true },
);

onMounted(() => {
  createPlot();
  window.addEventListener('resize', debouncedRelayout);
  window.addEventListener('orientationchange', debouncedRelayout);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedRelayout);
  window.removeEventListener('orientationchange', debouncedRelayout);
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
          debouncedRender(true);
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
</style>
