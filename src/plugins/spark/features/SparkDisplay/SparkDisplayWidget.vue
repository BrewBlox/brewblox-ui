<script lang="ts">
import { Component, Ref, Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { WS_HOST } from '@/helpers/const';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';

import { SparkDisplayConfig } from './types';

@Component
export default class SparkDisplayWidget extends WidgetBase<SparkDisplayConfig> {
  width = 320;
  height = 240;

  connected = true;
  connecting = false;
  preventReconnection = true;

  debug = false;

  // initialize to undefined so they are not reactive
  renderContext: CanvasRenderingContext2D | undefined = undefined;
  ws: WebSocket | undefined = undefined;
  buf: ArrayBuffer | undefined = undefined;
  buf8: Uint8ClampedArray | undefined = undefined;
  data: Uint32Array | undefined = undefined;
  rerender = true;
  handle: number | undefined = undefined;

  pressed = 0;

  @Ref('screen-canvas')
  readonly canvas!: HTMLCanvasElement;

  get serviceId(): string | null {
    return this.config.serviceId;
  }

  set serviceId(v: string | null) {
    this.config.serviceId = v;
    this.saveConfig();
  }

  get url(): string {
    return `${WS_HOST}/${this.serviceId}/sim/display`;
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get isValid(): boolean {
    return this.sparkModule
      ?.status
      ?.connectionKind === 'simulation';
  }

  get error(): string | null {
    if (!this.sparkModule) {
      return 'No service configured';
    }
    if (!this.sparkModule.status?.isSynchronized) {
      return 'Service is not connected';
    }
    if (!this.isValid) {
      return 'Service is not a simulation';
    }
    return null;
  }

  get serviceIds(): string[] {
    return sparkStore.serviceIds;
  }

  @Watch('serviceId')
  watchUrl(): void {
    this.closeSocket();
    this.setupSocket();
  }

  log(logline): void {
    if (this.debug === true) {
      console.log(logline); // eslint-disable-line
    }
  }

  beforeMount(): void {
    this.preventReconnection = false;
  }

  renderCanvas(): void {
    if (this.renderContext != null && this.buf8 != null) {
      const imagedata = this.renderContext.createImageData(this.width, this.height);
      imagedata.data.set(this.buf8);
      this.renderContext.putImageData(imagedata, 0, 0);
      this.rerender = false;
    }
  }

  mounted(): void {
    this.$nextTick(() => {
      this.renderContext = this.canvas.getContext('2d')!;

      if (this.renderContext != null) {
        this.buf = new ArrayBuffer(this.width * this.height * 4);
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.data = new Uint32Array(this.buf);

        for (let i = 0; i < this.width * this.height; i += 1) {
          this.data[i] = 255 << 24; // initalize alpha to 255, leave black
        }
        this.renderCanvas();
      }

      this.setupSocket();

      this.handle = window.setInterval(this.renderCanvas, 100); // 10 frames per second max
    });
  }

  beforeDestroy(): void {
    this.preventReconnection = true;
    this.closeSocket();
    this.renderContext = undefined;
    window.clearInterval(this.handle);
    this.handle = undefined;
  }

  closeSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
      this.connecting = false;
      this.connected = false;
    }
  }

  getMousePos(evt): XYPosition {
    return this.canvas != null
      ? {
        x: evt.clientX - this.canvas.offsetLeft,
        y: evt.clientY - this.canvas.offsetTop,
      }
      : {
        x: 0,
        y: 0,
      };
  }

  onMouseDown(evt): void {
    this.log(`mousedown ${evt} ${evt.button}`);
    if (evt.button === 0) {
      this.pressed += 1;
      this.touchscreen(evt);
    }
  }

  onMouseUp(evt): void {
    this.log(`mouseup ${evt} ${evt.button}`);
    if (evt.button === 0) {
      this.pressed -= 1;
      this.touchscreen(evt);
    }
  }

  onMouseMove(evt): void {
    if (this.pressed > 0) {
      this.touchscreen(evt);
    }
  }

  touchscreen(evt): void {
    const { x, y } = this.getMousePos(evt);
    if (this.connected && this.ws != null) {
      this.log(`sending touch ${x},${y},${this.pressed}`);
      const buf = new ArrayBuffer(5);
      const view = new DataView(buf);
      view.setInt8(0, this.pressed ? 1 : 2); // command
      view.setUint16(1, x, true);
      view.setUint16(3, y, true);
      this.ws.send(buf);
    }
    else {
      this.log('no touch event sent - not connected');
    }
  }

  setupSocket(): void {
    try {
      this.createSocket();
    }
    catch (e) {
      this.log(e);
      this.rescheduleSetup();
    }
  }

  createSocket(): void {
    if (this.error) {
      this.log(this.error);
      this.rescheduleSetup();
      return;
    }

    const ws = new WebSocket(this.url);
    this.log('connecting');
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.connecting = true;

    ws.onopen = () => {
      this.connecting = false;
      this.connected = true;
      this.log('Websocket connected');
    };

    ws.onmessage = (msg: MessageEvent) => {
      this.handleScreenUpdate(new DataView(msg.data), msg.data.byteLength);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      this.log('Websocket disconnected');
      this.closeSocket();
      this.rescheduleSetup();
    };
  }

  rescheduleSetup(): void {
    if (!this.preventReconnection) {
      this.log('rescheduling socket connect in 1000 ms');

      setTimeout(() => {
        this.closeSocket();
        this.log('Websocket reconnecting');
        this.setupSocket();
      }, 1000);
    }
  }

  handleScreenUpdate(buffer: DataView, length: number): void {
    let index = 0;
    while (index < length && this.data != null) {
      const addr = buffer.getUint32(index, true);
      const color = buffer.getUint32(index + 4, true);

      const rr = ((color >>> 11) % 32);
      const gg = ((color >>> 5) % 64);
      const bb = ((color >>> 0) % 32);

      const r = (rr << 3) | ((rr >>> 2) & 7);
      const g = (gg << 2) | ((gg >>> 3) & 3);
      const b = (bb << 3) | ((bb >>> 2) & 7);

      this.data[addr] =
        (255 << 24) | // alpha
        (b << 16) | // blue
        (g << 8) | // green
        r; // red

      index += 8;
    }
    this.rerender = true;
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div
      v-show="mode === 'Basic' && isValid"
      class="row items-center q-pa-md"
    >
      <canvas
        ref="screen-canvas"
        :hidden="!connected"
        :width="width"
        :height="height"
        class="view col-auto"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
      />
      <div
        :hidden="connected"
        :width="width"
        :height="height"
        class="glass col-auto"
      />
    </div>

    <div
      v-if="mode === 'Basic' && error"
      class="col row justify-center items-center text-h5 q-gutter-x-md q-mt-lg"
    >
      <q-icon name="warning" color="warning" />
      <div class="col-auto">
        {{ error }}
      </div>
    </div>

    <div
      v-if="mode === 'Full'"
      class="widget-body row"
    >
      <q-select
        v-model="serviceId"
        :options="serviceIds"
        label="Service"
        item-aligned
        class="col-grow"
        @keyup.enter.exact.stop
      />
    </div>
  </CardWrapper>
</template>


<style lang="sass" scoped>
.display
  margin: 0 auto

.glass,
.view
  display: block
  margin: 0 auto
  width: 320px
  height: 240px

.glass
  background-color: rgba(255, 255, 255, 0.75)
  filter: blur(5px)
  display: none
</style>
