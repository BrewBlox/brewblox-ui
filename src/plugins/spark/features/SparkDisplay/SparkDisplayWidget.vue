<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useContext, useWidget } from '@/composables';
import { WS_HOST } from '@/const';
import { useSparkStore } from '@/plugins/spark/store';
import { SparkDisplayWidget } from './types';

// Values are also defined in style section
const WIDTH = 480;
const HEIGHT = 320;

const sparkStore = useSparkStore();
const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<SparkDisplayWidget>();

const connected = ref(true);
let preventReconnection = false;
let debug = false;

let renderContext: CanvasRenderingContext2D | null = null;
let ws: WebSocket | null = null;
let buf: ArrayBuffer | null = null;
let buf8: Uint8ClampedArray | null = null;
let data: Uint32Array | null = null;
let handle: number | undefined = undefined;

let pressed = 0;
const canvasRef = ref<HTMLCanvasElement>();

const serviceId = computed<string | null>({
  get: () => config.value.serviceId,
  set: (serviceId) => patchConfig({ serviceId }),
});

const url = computed<string>(() => `${WS_HOST}/${serviceId.value}/sim/display`);

const isValid = computed<boolean>(
  () => sparkStore.statusByService(serviceId.value)?.connection_kind === 'SIM',
);

const error = computed<string | null>(() => {
  const status = sparkStore.statusByService(serviceId.value);
  if (!status) {
    return 'No service configured';
  }
  if (status.connection_status !== 'SYNCHRONIZED') {
    return 'Service is not connected';
  }
  if (status.connection_kind !== 'SIM') {
    return 'Service is not a simulation';
  }
  return null;
});

const serviceIds = computed<string[]>(() => sparkStore.serviceIds);

watch(
  () => serviceId.value,
  () => {
    closeSocket();
    setupSocket();
  },
);

function log(logline: any): void {
  if (debug === true) {
    console.log(logline); // eslint-disable-line
  }
}

function renderCanvas(): void {
  if (renderContext != null && buf8 != null) {
    const imagedata = renderContext.createImageData(WIDTH, HEIGHT);
    imagedata.data.set(buf8);
    renderContext.putImageData(imagedata, 0, 0);
  }
}

const cancelWatcher = watch(
  () => canvasRef.value,
  (el: HTMLCanvasElement | undefined) => {
    if (el) {
      renderContext = el.getContext('2d');
      if (renderContext != null) {
        buf = new ArrayBuffer(WIDTH * HEIGHT * 4);
        buf8 = new Uint8ClampedArray(buf);
        data = new Uint32Array(buf);

        for (let i = 0; i < WIDTH * HEIGHT; i += 1) {
          data[i] = 255 << 24; // initalize alpha to 255, leave black
        }
        renderCanvas();
        setupSocket();
        setupRender();
        cancelWatcher();
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  preventReconnection = true;
  closeSocket();
  renderContext = null;
  window.clearInterval(handle);
  handle = undefined;
});

function closeSocket(): void {
  if (ws) {
    ws.close();
    ws = null;
    connected.value = false;
  }
}

function getMousePos(evt): XYPosition {
  return canvasRef.value != null
    ? {
        x: evt.clientX - canvasRef.value.offsetLeft,
        y: evt.clientY - canvasRef.value.offsetTop,
      }
    : {
        x: 0,
        y: 0,
      };
}

function onMouseDown(evt): void {
  log(`mousedown ${evt} ${evt.button}`);
  if (evt.button === 0) {
    pressed += 1;
    touchscreen(evt);
  }
}

function onMouseUp(evt): void {
  log(`mouseup ${evt} ${evt.button}`);
  if (evt.button === 0) {
    pressed -= 1;
    touchscreen(evt);
  }
}

function onMouseMove(evt): void {
  if (pressed > 0) {
    touchscreen(evt);
  }
}

function touchscreen(evt): void {
  const { x, y } = getMousePos(evt);
  if (connected.value && ws != null) {
    log(`sending touch ${x},${y},${pressed}`);
    const buf = new ArrayBuffer(5);
    const view = new DataView(buf);
    view.setInt8(0, pressed ? 1 : 2); // command
    view.setUint16(1, x, true);
    view.setUint16(3, y, true);
    ws.send(buf);
  } else {
    log('no touch event sent - not connected');
  }
}

function setupRender(): void {
  if (handle !== undefined) {
    window.clearInterval(handle);
  }
  handle = window.setInterval(renderCanvas, 100); // 10 frames per second max
}

function setupSocket(): void {
  try {
    createSocket();
  } catch (e) {
    log(e);
    rescheduleSetup();
  }
}

function createSocket(): void {
  if (error.value) {
    log(error.value);
    rescheduleSetup();
    return;
  }

  ws = new WebSocket(url.value);
  log('connecting');
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    connected.value = true;
    log('Websocket connected');
  };

  ws.onmessage = (msg: MessageEvent) => {
    handleScreenUpdate(new DataView(msg.data), msg.data.byteLength);
  };

  ws.onerror = () => {
    ws?.close();
  };

  ws.onclose = () => {
    log('Websocket disconnected');
    closeSocket();
    rescheduleSetup();
  };
}

function rescheduleSetup(): void {
  if (!preventReconnection) {
    log('rescheduling socket connect in 1000 ms');

    setTimeout(() => {
      closeSocket();
      log('Websocket reconnecting');
      setupSocket();
    }, 1000);
  }
}

function handleScreenUpdate(buffer: DataView, length: number): void {
  let index = 0;
  while (index < length && data != null) {
    const addr = buffer.getUint32(index, true);
    const color = buffer.getUint32(index + 4, true);

    const rr = (color >>> 11) % 32;
    const gg = (color >>> 5) % 64;
    const bb = (color >>> 0) % 32;

    const r = (rr << 3) | ((rr >>> 2) & 7);
    const g = (gg << 2) | ((gg >>> 3) & 3);
    const b = (bb << 3) | ((bb >>> 2) & 7);

    data[addr] =
      (255 << 24) | // alpha
      (b << 16) | // blue
      (g << 8) | // green
      r; // red

    index += 8;
  }
}
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div
      v-show="context.mode === 'Basic' && isValid"
      class="row items-center q-pa-md"
    >
      <canvas
        ref="canvasRef"
        :hidden="!connected"
        :width="WIDTH"
        :height="HEIGHT"
        class="view col-auto"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
      />
      <div
        :hidden="connected"
        :width="WIDTH"
        :height="HEIGHT"
        class="glass col-auto"
      />
    </div>

    <div
      v-if="context.mode === 'Basic' && error"
      class="col row justify-center items-center text-h5 q-gutter-x-md q-my-lg"
    >
      <q-icon
        name="warning"
        color="warning"
      />
      <div class="col-auto">
        {{ error }}
      </div>
    </div>

    <div
      v-if="context.mode === 'Full'"
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
  </Card>
</template>

<style lang="sass" scoped>
.display
  margin: 0 auto

.glass,
.view
  display: block
  margin: 0 auto
  width: 480px
  height: 320px

.glass
  background-color: rgba(255, 255, 255, 0.75)
  filter: blur(5px)
  display: none
</style>
