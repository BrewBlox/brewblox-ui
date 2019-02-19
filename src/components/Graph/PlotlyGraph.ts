import Plotly from 'plotly.js';
import Vue from 'vue';
import Component from 'vue-class-component';

interface VueProp {
  type: any;
  required?: boolean;
  default: any;
}

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

const updateEvents = [
  'plotly_restyle',
  'plotly_redraw',
  'plotly_relayout',
  'plotly_doubleclick',
  'plotly_animated',
];

const isBrowser = typeof window !== 'undefined';
const hasReactAPIMethod = !!Plotly.react;

const isNumber =
  (n: any): boolean => !Number.isNaN(parseFloat(n)) && Number.isFinite(n);

const eventReducer =
  (acc: { [key: string]: VueProp }, event: string): typeof acc =>
    ({
      ...acc,
      [`on${event}`]: {
        type: Function,
        default: () => () => { },
      },
    });

@Component({
  props: {
    fit: {
      type: Boolean,
      default: () => false,
    },
    data: {
      type: Array,
      default: () => ([]),
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
      default: () => ([]),
    },
    useResizeHandler: {
      type: Boolean,
      default: () => false,
    },
    revision: {
      type: Number,
      default: () => undefined,
    },
    className: {
      type: String,
      default: () => undefined,
    },
    id: {
      type: String,
      default: () => undefined,
    },
    onError: {
      type: Function,
      default: () => {
      },
    },
    onInitialized: {
      type: Function,
      default: () => {
      },
    },
    onUpdate: {
      type: Function,
      default: () => {
      },
    },
    onPurge: {
      type: Function,
      default: () => {
      },
    },
    ...eventNames.reduce(eventReducer, {}),
  },
})
export default class PlotlyGraph extends Vue {
  private fitHandler: EventListener | null = null;
  private resizeHandler: EventListener | null = null;
  private handlers = {};

  private get plotlyElement(): any {
    return this.$refs.plotly;
  }

  private handlePropsUpdate(): void {
    if (!hasReactAPIMethod) {
      this.handlers = {};
    }

    const update = hasReactAPIMethod ? Plotly.react : Plotly.newPlot;

    update(
      this.plotlyElement,
      this.$props.data,
      this.resizedLayoutIfFit(this.$props.layout),
      this.$props.config,
    )
      .then(() => this.syncEventHandlers())
      .then(() => this.syncWindowResize())
      .then(() => {
        if (!hasReactAPIMethod) this.attachUpdateEvents();
      })
      .then(() => this.handleUpdateWithProps(this.$props))
      .catch((e) => {
        console.error('Error while plotting:', e); // eslint-disable-line no-console
        return this.$props.onError();
      });
  }

  private removeUpdateEvents(): void {
    if (!this.plotlyElement || !this.plotlyElement.removeListener) return;

    updateEvents.forEach((eventName) => {
      this.plotlyElement.removeListener(eventName, this.handleUpdate);
    });
  }

  private attachUpdateEvents(): void {
    if (!this.plotlyElement || !this.plotlyElement.removeListener) return;

    updateEvents.forEach((eventName) => {
      this.plotlyElement.on(eventName, this.handleUpdate);
    });
  }

  private handleUpdate(): void {
    this.handleUpdateWithProps(this.$props);
  }

  private handleUpdateWithProps(props): void {
    props.onUpdate(this.plotlyElement);
  }

  // Attach and remove event handlers as they're added or removed from props:
  private syncEventHandlers(propsIn = null): void {
    // Allow use of nextProps if passed explicitly:
    const props = propsIn || this.$props;

    eventNames.forEach((eventName) => {
      const prop = props[`on${eventName}`];
      const hasHandler = !!this.handlers[eventName];

      if (prop && !hasHandler) {
        this.handlers[eventName] = prop;
        this.plotlyElement.on(
          `plotly_${eventName.toLowerCase()}`,
          this.handlers[eventName],
        );
      } else if (!prop && hasHandler) {
        // Needs to be removed:
        this.plotlyElement.removeListener(
          `plotly_${eventName.toLowerCase()}`,
          this.handlers[eventName],
        );
        delete this.handlers[eventName];
      }
    });
  }

  private syncWindowResize(props = this.$props, invoke = false): void {
    if (!isBrowser) return;

    if (props.fit && !this.fitHandler) {
      this.fitHandler = () => Plotly.relayout(this.plotlyElement, this.getSize());

      window.addEventListener('resize', this.fitHandler as EventListener);

      if (invoke) {
        this.fitHandler(new Event('manual-invoke'));
        return;
      }
    } else if (!props.fit && this.fitHandler) {
      window.removeEventListener('resize', this.fitHandler);

      this.fitHandler = null;
    }

    if (props.useResizeHandler && !this.resizeHandler) {
      this.resizeHandler = () => Plotly.Plots.resize(this.plotlyElement);

      window.addEventListener('resize', this.resizeHandler);
    } else if (!props.useResizeHandler && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);

      this.resizeHandler = null;
    }
  }

  private resizedLayoutIfFit(layout: Plotly.Layout): Plotly.Layout {
    if (!this.$props.fit) {
      return layout;
    }
    return Object.assign({}, layout, this.getSize(layout));
  }

  private getSize(layout = this.$props.layout): { width: number; height: number } {
    let rect: any = {};
    const layoutWidth = layout ? layout.width : null;
    const layoutHeight = layout ? layout.height : null;
    const hasWidth = isNumber(layoutWidth);
    const hasHeight = isNumber(layoutHeight);

    if (!hasWidth || !hasHeight) {
      rect = this.plotlyElement.parentElement.getBoundingClientRect();
    }

    return {
      width: hasWidth ? parseInt(layoutWidth, 10) : rect.width,
      height: hasHeight ? parseInt(layoutHeight, 10) : rect.height,
    };
  }

  public created(): void {
    this.handleUpdate = this.handleUpdate.bind(this);
    this.$watch('$props.config', this.handlePropsUpdate);
    this.$watch('$props.data', this.handlePropsUpdate);
    this.$watch('$props.frames', this.handlePropsUpdate);
    this.$watch('$props.layout', this.handlePropsUpdate);
    this.$watch('$props.revision', this.handlePropsUpdate);
  }

  public mounted(): void {
    Plotly.newPlot(
      this.plotlyElement,
      this.$props.data,
      this.resizedLayoutIfFit(this.$props.layout),
      this.$props.config,
    )
      .then(() => this.syncWindowResize())
      .then(() => this.syncEventHandlers())
      .then(() => this.attachUpdateEvents())
      .then(() => this.$props.onInitialized(this.plotlyElement))
      .catch((e) => {
        console.error('Error while plotting:', e); // eslint-disable-line no-console
        return this.$props.onError();
      });
  }

  public beforeDestroy(): void {
    this.$props.onPurge(this.plotlyElement);

    if (this.fitHandler && isBrowser) {
      window.removeEventListener('resize', this.fitHandler);
      this.fitHandler = null;
    }
    if (this.resizeHandler && isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.removeUpdateEvents();

    Plotly.purge(this.plotlyElement);
  }

  public render(createElement: Function): void {
    return createElement(
      'div',
      {
        props: {
          id: this.$props.id,
          class: this.$props.className,
        },
        ref: 'plotly',
      },
    );
  }
}
