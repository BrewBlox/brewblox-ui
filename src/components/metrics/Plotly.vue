<template>
  <div ref="plotly" />
</template>

<script>
const Plotly = require('plotly.js');

// The naming convention is:
//   - events are attached as `'plotly_' + eventName.toLowerCase()`
//   - vue props are `'on' + eventName`
const eventNames = [
  'AfterExport',
  'AfterPlot',
  'Animated',
  'AnimatingFrame',
  'AnimationInterrupted',
  'AutoSize',
  'BeforeExport',
  'ButtonClicked',
  'Click',
  'ClickAnnotation',
  'Deselect',
  'DoubleClick',
  'Framework',
  'Hover',
  'Relayout',
  'Restyle',
  'Redraw',
  'Selected',
  'Selecting',
  'SliderChange',
  'SliderEnd',
  'SliderStart',
  'Transitioning',
  'TransitionInterrupted',
  'Unhover',
];

const isBrowser = typeof window !== 'undefined';

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default {
  name: 'Plotly',
  fitHandler: null,
  resizeHandler: null,
  handlers: {},

  props: {
    fit: {
      type: Boolean,
      default: () => false,
    },
    data: {
      type: Array,
      default: () => [],
    },
    layout: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    frames: {
      type: Array,
      default: () => [],
    },
    useResizeHandler: {
      type: Boolean,
      default: () => false,
    },
    onError: {
      type: Function,
      default: () => {},
    },
    onInitialized: {
      type: Function,
      default: () => {},
    },
  },

  mounted() {
    Plotly.newPlot(this.$refs.plotly, {
      data: this.data,
      layout: this.resizedLayoutIfFit(this.layout),
      config: this.config,
      frames: this.frames,
    })
      .then(() => this.syncWindowResize(null, false))
      .then(() => this.syncEventHandlers())
      // .then(this.attachUpdateEvents)
      .then(() => this.$props.onInitialized(this.$refs.plotly))
      .catch((e) => {
        console.error('Error while plotting:', e);
        return this.$props.onError();
      });
  },

  methods: {
    // Attach and remove event handlers as they're added or removed from props:
    syncEventHandlers(propsIn) {
      // Allow use of nextProps if passed explicitly:
      const props = propsIn || this.$props;

      eventNames.forEach((eventName) => {
        const prop = props[`on${eventName}`];
        const hasHandler = !!this.handlers[eventName];

        if (prop && !hasHandler) {
          this.handlers[eventName] = prop;
          this.$refs.plotly.on(
            `plotly_${eventName.toLowerCase()}`,
            this.handlers[eventName],
          );
        } else if (!prop && hasHandler) {
          // Needs to be removed:
          this.$refs.plotly.removeListener(
            `plotly_${eventName.toLowerCase()}`,
            this.handlers[eventName],
          );
          delete this.handlers[eventName];
        }
      });
    },

    syncWindowResize(propsIn, invoke) {
      const props = propsIn || this.$props;
      if (!isBrowser) return;

      if (props.fit && !this.fitHandler) {
        this.fitHandler = () => Plotly.relayout(this.$refs.plotly, this.getSize());

        window.addEventListener('resize', this.fitHandler);

        if (invoke) {
          this.fitHandler();
          return;
        }
      } else if (!props.fit && this.fitHandler) {
        window.removeEventListener('resize', this.fitHandler);

        this.fitHandler = null;
      }

      if (props.useResizeHandler && !this.resizeHandler) {
        this.resizeHandler = () => Plotly.Plots.resize(this.$refs.plotly);

        window.addEventListener('resize', this.resizeHandler);
      } else if (!props.useResizeHandler && this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);

        this.resizeHandler = null;
      }
    },

    resizedLayoutIfFit(layout) {
      if (!this.$props.fit) {
        return layout;
      }
      return Object.assign({}, layout, this.getSize(layout));
    },

    getSize(layoutIn) {
      let rect;
      const layout = layoutIn || this.$props.layout;
      const layoutWidth = layout ? layout.width : null;
      const layoutHeight = layout ? layout.height : null;
      const hasWidth = isNumber(layoutWidth);
      const hasHeight = isNumber(layoutHeight);

      if (!hasWidth || !hasHeight) {
        rect = this.$refs.plotly.parentElement.getBoundingClientRect();
      }

      return {
        width: hasWidth ? parseInt(layoutWidth, 10) : rect.width,
        height: hasHeight ? parseInt(layoutHeight, 10) : rect.height,
      };
    },
  },
};
</script>

<style scoped>

</style>
