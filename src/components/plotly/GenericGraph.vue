<script lang="ts">
import { useGlobals } from '@/composables';
import { GraphAnnotation } from '@/plugins/history/types';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import merge from 'lodash/merge';
import { nanoid } from 'nanoid';
import {
  ClickAnnotationEvent,
  Config,
  Layout,
  PlotData,
  PlotMouseEvent,
} from 'plotly.js';
import { computed, defineComponent, PropType } from 'vue';
import PlotlyGraph from './PlotlyGraph.vue';

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
    zerolinecolor: '#aef',
    autorange: true,
    tickfont: {
      color: '#aef',
    },
  },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  hovermode: 'closest',
});

export default defineComponent({
  name: 'GenericGraph',
  components: {
    PlotlyGraph,
  },
  props: {
    data: {
      type: Array as PropType<Partial<PlotData>[]>,
      required: true,
    },
    layout: {
      type: Object as PropType<Partial<Layout>>,
      required: true,
    },
    annotated: {
      type: Boolean,
      default: false,
    },
    maximized: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['annotations'],
  setup(props, { emit }) {
    const id = nanoid();

    const { dense } = useGlobals.setup();

    const plotlyLayout = computed<Partial<Layout>>(() =>
      merge(layoutDefaults(), props.layout),
    );

    const plotlyConfig = computed<Partial<Config>>(() => ({
      displaylogo: false,
      responsive: true,
      staticPlot: dense.value && !props.maximized,
    }));

    const ready = computed<boolean>(
      () =>
        props.data != null &&
        plotlyLayout.value != null &&
        plotlyConfig.value != null,
    );

    const annotations = computed<GraphAnnotation[]>(
      () => props.layout.annotations ?? [],
    );

    function displayError(msg: string): void {
      notify.warn(`Failed to render graph: ${msg}`);
    }

    function onGraphClick(evt: PlotMouseEvent): void {
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
        annotations.value.push({
          x: point.x as string,
          y: parseFloat((point.y as number).toPrecision(4)),
          xref: 'x',
          yref: point.data.yaxis as 'y',
          text,
          visible: true,
          arrowhead: 7,
          arrowcolor: 'white',
          captureevents: true,
        });
        emit('annotations', annotations);
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
          modelValue: annotation.text,
        },
      }).onOk(({ text, remove }: { text: string; remove: boolean }) => {
        remove
          ? annotations.value.splice(evt.index, 1)
          : annotations.value.splice(evt.index, 1, { ...annotation, text });
        emit('annotations', annotations.value);
      });
    }

    return {
      id,
      ready,
      plotlyLayout,
      plotlyConfig,
      displayError,
      onGraphClick,
      onAnnotationClick,
    };
  },
});
</script>

<template>
  <PlotlyGraph
    v-if="ready"
    :id="id"
    :data="data"
    :layout="plotlyLayout"
    :config="plotlyConfig"
    class="fit"
    v-bind="$attrs"
    @error="displayError"
    @plotly_click="onGraphClick"
    @plotly_clickannotation="onAnnotationClick"
  />
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
