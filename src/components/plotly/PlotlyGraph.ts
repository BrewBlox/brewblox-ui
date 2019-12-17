import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import Plotly, { Config, Frame, Layout, PlotData } from 'plotly.js';
import { debounce } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

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
  private firstRender = false;
  private zoomed = false;
  private skippedRender = false;

  @Ref()
  public readonly plotlyElement!: any;

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
  public readonly plotlyClass!: string | string[] | Mapped<string>;

  private attachListeners(): void {
    Object.keys(this.$listeners)
      .forEach(name => this.plotlyElement.on(name, (...args) => this.$emit(name, ...args)));
    this.plotlyElement.on('plotly_relayout', this.onRelayout);
    this.plotlyElement.on('plotly_doubleclick', this.onDoubleClick);
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

  private relayoutPlot(): void {
    Plotly.relayout(this.plotlyElement, this.resizedLayout());
  }

  private resizePlot(): void {
    Plotly.Plots.resize(this.plotlyElement);
  }

  private onRelayout(eventdata: Mapped<any>): void {
    if (eventdata['xaxis.range[0]'] || eventdata['xaxis.range[1]']) {
      this.zoomed = true;
    }
  }

  private onDoubleClick(): void {
    this.zoomed = false;
    if (this.skippedRender) {
      this.skippedRender = false;
      this.renderPlot();
    }
  }

  private get extendedConfig(): Partial<Config> {
    return {
      ...this.config,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      modeBarButtonsToAdd: [{
        name: 'toImageLarge',
        title: 'Download plot as a png',
        icon: Plotly['Icons'].camera,
        click: (el) =>
          Plotly.downloadImage(el, {
            format: 'png',
            width: 3000,
            height: 1500,
            filename: get(this.layout, 'title.text', this.layout.title) || 'graph',
          }),
      }],
    };
  }

  private async createPlot(): Promise<void> {
    if (!this.plotlyElement) {
      return;
    }
    try {
      // https://plot.ly/javascript/plotlyjs-function-reference/#plotlynewplot
      await Plotly.newPlot(
        this.plotlyElement,
        this.data,
        this.resizedLayout(),
        this.extendedConfig,
      );
      this.attachListeners();
    } catch (e) {
      this.$emit('error', e.message);
    }
  }

  private async renderPlot(): Promise<void> {
    if (!this.plotlyElement) {
      return;
    }
    if (this.zoomed) {
      this.skippedRender = true;
      return;
    }
    try {
      await Plotly.react(
        this.plotlyElement,
        this.data,
        this.resizedLayout(),
        this.extendedConfig,
      );
    } catch (e) {
      this.$emit('error', e.message);
    }
  }

  private resizeHandler(): void {
    if (this.autoFit) {
      this.relayoutPlot();
    }
    if (this.autoResize) {
      this.resizePlot();
    }
  }

  public created(): void {
    const updateFunc = debounce(this.renderPlot, 50, false) as (this: this, n: any, o: any) => void;

    this.$watch('config', updateFunc);
    this.$watch('data', updateFunc);
    this.$watch('frames', updateFunc);
    this.$watch('layout', updateFunc);
    this.$watch('revision', updateFunc);
  }

  public mounted(): void {
    this.createPlot();
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
        ref: 'plotlyElement',
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
