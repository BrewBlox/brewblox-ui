<script setup lang="ts">
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';
import Plotly, {
  ClickAnnotationEvent,
  Config,
  Frame,
  Layout,
  PlotData,
  PlotlyHTMLElement,
  PlotMouseEvent,
} from 'plotly.js';
import { debounce } from 'quasar';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
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
  frames: {
    type: Array as PropType<Frame[]>,
    default: () => [],
  },
  autoFit: {
    type: Boolean,
    default: false,
  },
  interactable: {
    type: Boolean,
    default: true,
  },
  autoResize: {
    type: Boolean,
    default: false,
  },
  revision: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits<{
  // From this component
  (e: 'error', msg: string): void;

  // Forwarded from plotly
  // This is not an exhaustive list
  // more should be added if desired
  (e: 'plotly_click', evt: PlotMouseEvent): void;
  (e: 'plotly_clickannotation', evt: ClickAnnotationEvent): void;
}>();

const plotlyElement = ref<PlotlyHTMLElement>();
let zoomed = false;
let skippedRender = false;

function attachListeners(): void {
  const el = plotlyElement.value;
  if (!el) {
    return;
  }

  // Local
  el.on('plotly_relayout', onRelayout);
  el.on('plotly_doubleclick', onDoubleClick);

  // Forwarded to parent
  el.on('plotly_click', (evt) => emit('plotly_click', evt));
  el.on('plotly_clickannotation', (evt) => emit('plotly_clickannotation', evt));
}

function getSize(): { width: number; height: number } {
  const layout = props.layout;
  let rect: any = {};
  const layoutWidth = layout ? layout.width : null;
  const layoutHeight = layout ? layout.height : null;
  const hasWidth = isNumber(layoutWidth);
  const hasHeight = isNumber(layoutHeight);

  if (!hasWidth || !hasHeight) {
    rect = plotlyElement.value?.parentElement!.getBoundingClientRect();
  }

  return {
    width: hasWidth ? layoutWidth : rect.width,
    height: hasHeight ? layoutHeight : rect.height,
  };
}

function adjustedLayout(): Partial<Layout> {
  const layout = merge({}, props.layout);
  if (props.autoFit) {
    merge(layout, getSize());
  }
  if (!props.interactable) {
    merge(layout, { dragmode: false, hovermode: false });
  }
  return layout;
}

async function relayoutPlot(): Promise<void> {
  await Plotly.relayout(plotlyElement.value!, adjustedLayout());
}

async function resizePlot(): Promise<void> {
  Plotly.Plots.resize(plotlyElement.value!);
}

async function reactPlot(): Promise<void> {
  await Plotly.react(
    plotlyElement.value!,
    props.data,
    adjustedLayout(),
    extendedConfig.value,
  );
}

function onRelayout(eventdata: Mapped<any>): void {
  if (eventdata['xaxis.range[0]'] || eventdata['xaxis.range[1]']) {
    zoomed = true;
  }
}

function onDoubleClick(): void {
  zoomed = false;
  if (skippedRender) {
    skippedRender = false;
    renderPlot();
  }
}

const extendedConfig = computed<Partial<Config>>(() => ({
  ...props.config,
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
}));

async function createPlot(): Promise<void> {
  if (!plotlyElement.value) {
    return;
  }
  try {
    // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
    await Plotly.newPlot(
      plotlyElement.value,
      props.data,
      adjustedLayout(),
      extendedConfig.value,
    );
    attachListeners();
  } catch (e: any) {
    emit('error', e.message);
  }
}

async function renderPlot(layoutChanged = false): Promise<void> {
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
    emit('error', e.message);
  }
}

function resizeHandler(): void {
  if (props.autoFit) {
    relayoutPlot();
  }
  if (props.autoResize) {
    resizePlot();
  }
}

const updateFunc = debounce(renderPlot, 50, false);

watch(
  () => [props.config, props.data, props.frames, props.revision],
  () => updateFunc(),
);

watch(
  () => props.layout,
  () => updateFunc(true),
  { deep: true },
);

watch(
  () => props.revision,
  () => resizePlot(),
);

onMounted(() => {
  createPlot();
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('orientationchange', resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler);
  window.removeEventListener('orientationchange', resizeHandler);
  Plotly.purge(plotlyElement.value!);
});
</script>

<template>
  <div ref="plotlyElement" />
</template>
