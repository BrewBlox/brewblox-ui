<script lang="ts">
import { capitalize } from 'lodash';
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import Plotly, { Config, Frame, Layout, PlotData, PlotlyHTMLElement } from 'plotly.js';
import { debounce } from 'quasar';
import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';

const plotlyEvents = [
  'plotly_afterexport',
  'plotly_afterplot',
  'plotly_animated',
  'plotly_animatingframe',
  'plotly_animationinterrupted',
  'plotly_autosize',
  'plotly_beforeexport',
  'plotly_buttonclicked',
  'plotly_click',
  'plotly_clickannotation',
  'plotly_deselect',
  'plotly_doubleclick',
  'plotly_framework',
  'plotly_hover',
  'plotly_relayout',
  'plotly_restyle',
  'plotly_redraw',
  'plotly_selected',
  'plotly_selecting',
  'plotly_sliderchange',
  'plotly_sliderend',
  'plotly_sliderstart',
  'plotly_transitioning',
  'plotly_transitioninterrupted',
  'plotly_unhover',
];

export default defineComponent({
  name: 'PlotlyGraph',
  props: {
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Array as PropType<PlotData[]>,
      default: () => [],
    },
    layout: {
      type: Object as PropType<Layout>,
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
    autoResize: {
      type: Boolean,
      default: false,
    },
    revision: {
      type: Number,
      default: 0,
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '100%',
    },
    plotlyClass: {
      type: [String, Array, Object] as PropType<string | string[] | Mapped<string>>,
      default: '',
    },
  },
  emits: [
    'error',
    ...plotlyEvents,
  ],
  setup(props, { emit, attrs }) {
    const plotlyElement = ref<PlotlyHTMLElement>();
    let zoomed = false;
    let skippedRender = false;

    function attachListeners(): void {
      plotlyEvents
        .filter(ev => typeof attrs[`on${capitalize(ev)}`] === 'function')
        .forEach(ev => plotlyElement.value!.on(ev as any, (...args: any[]) => emit(ev, ...args)));
      plotlyElement.value!.on('plotly_relayout', onRelayout);
      plotlyElement.value!.on('plotly_doubleclick', onDoubleClick);
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

    function resizedLayout(): Plotly.Layout {
      return props.autoFit
        ? Object.assign({}, props.layout, getSize())
        : props.layout;
    }

    async function relayoutPlot(): Promise<void> {
      await Plotly.relayout(plotlyElement.value!, resizedLayout());
    }

    async function resizePlot(): Promise<void> {
      Plotly.Plots.resize(plotlyElement.value!);
    }

    async function reactPlot(): Promise<void> {
      await Plotly.react(
        plotlyElement.value!,
        props.data,
        resizedLayout(),
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

    const extendedConfig = computed<Partial<Config>>(
      () => ({
        ...props.config,
        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
        modeBarButtonsToAdd: [{
          name: 'toImageLarge',
          title: 'Download plot as a jpeg',
          icon: Plotly['Icons'].camera,
          click: (el) =>
            Plotly.downloadImage(el, {
              format: 'jpeg',
              width: 3000,
              height: 1500,
              filename: get(props.layout, 'title.text', props.layout.title) || 'graph',
            }),
        }],
      }),
    );

    async function createPlot(): Promise<void> {
      if (!plotlyElement.value) {
        return;
      }
      try {
        // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
        await Plotly.newPlot(
          plotlyElement.value,
          props.data,
          resizedLayout(),
          extendedConfig.value,
        );
        attachListeners();
      } catch (e) {
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
        layoutChanged
          ? await relayoutPlot()
          : await reactPlot();
      } catch (e) {
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

    return {
      plotlyElement,
    };
  },
});
</script>

<template>
  <div
    :id="id"
    ref="plotlyElement"
    :class="plotlyClass"
    :width="width"
    :height="height"
  />
</template>
