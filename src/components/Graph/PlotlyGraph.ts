import isNumber from 'lodash/isNumber';
import Plotly, { Config, Frame, Layout, PlotData } from 'plotly.js';
import { debounce } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

// This component forwards all events emitted by Plotly
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const eventNames = [
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

@Component
export default class PlotlyGraph extends Vue {

  @Prop({ type: String, required: true })
  public readonly id!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly data!: PlotData[];

  @Prop({ type: Object, default: () => ({}) })
  public readonly layout!: Layout;

  @Prop({ type: Object, default: () => ({}) })
  public readonly config!: Partial<Config>;

  @Prop({ type: Array, default: () => [] })
  public readonly frames!: Frame[];

  @Prop({ type: Boolean, default: false })
  public readonly autoFit!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly autoResize!: boolean;

  @Prop({ type: Number })
  public readonly revision!: number;

  @Prop({ type: String, default: '100%' })
  public readonly width!: string;

  @Prop({ type: String, default: '100%' })
  public readonly height!: string;

  @Prop({ type: [String, Array, Object], default: '' })
  public readonly plotlyClass!: string | string[] | Record<string, string>;

  private get plotlyElement(): any {
    return this.$refs.plotly;
  }

  private attachListeners() {
    Object.keys(this.$listeners)
      .forEach(name => this.plotlyElement.on(name, (...args) => this.$emit(name, ...args)));
  }

  private getSize(): { width: number; height: number } {
    const layout = this.layout;
    let rect: any = {};
    const layoutWidth = layout ? layout.width : null;
    const layoutHeight = layout ? layout.height : null;
    const hasWidth = isNumber(layoutWidth);
    const hasHeight = isNumber(layoutHeight);

    if (!hasWidth || !hasHeight) {
      rect = this.plotlyElement.parentElement.getBoundingClientRect();
    }

    return {
      width: hasWidth ? layoutWidth : rect.width,
      height: hasHeight ? layoutHeight : rect.height,
    };
  }

  private resizedLayout(): Plotly.Layout {
    return this.autoFit
      ? Object.assign({}, this.layout, this.getSize())
      : this.layout;
  }

  private relayoutPlot() {
    Plotly.relayout(this.plotlyElement, this.resizedLayout());
  }

  private resizePlot() {
    Plotly.Plots.resize(this.plotlyElement);
  }

  private renderPlot(): void {
    // According to the Plotly documentation,
    // Plotly.react() is much faster for updating existing Plots.
    // The downside is that parent <span> elements get confused, and rerender empty.
    // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
    Plotly.newPlot(
      this.plotlyElement,
      this.data,
      this.resizedLayout(),
      this.config,
    )
      .then(this.attachListeners)
      .catch((e: Error) => this.$emit('error', e.message));
  }

  private resizeHandler() {
    if (this.autoFit) {
      this.relayoutPlot();
    }
    if (this.autoResize) {
      this.resizePlot();
    }
  }

  public created(): void {
    const updateFunc = debounce(this.renderPlot, 50, false);

    this.$watch('config', updateFunc);
    this.$watch('data', updateFunc);
    this.$watch('frames', updateFunc);
    this.$watch('layout', updateFunc);
    this.$watch('revision', updateFunc);
  }

  public mounted(): void {
    this.renderPlot();
    window.addEventListener('resize', this.resizeHandler);
    this.$watch('revision', this.resizePlot);
  }

  public beforeDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    Plotly.purge(this.plotlyElement);
  }

  public render(createElement: Function): void {
    return createElement(
      'div',
      {
        ref: 'plotly',
        props: {
          id: this.id,
          class: this.plotlyClass,
          width: this.width,
          height: this.height,
        },
      },
    );
  }
}
