<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import {
  ChannelConfig,
  ChannelStatus,
  DigitalState,
  GpioDeviceType,
  GpioModuleChannel,
  GpioPins,
  OneWireGpioModuleBlock,
} from '@/shared-types';

interface DeviceSlot {
  id: number;
  name: string;
  start: number;
  width: number;
}

interface UnusedSlot {
  start: number;
  free: number;
}

function startBit(n: number): number {
  return n > 0
    ? Math.log2(n & -n)
    : -1;
}

export default defineComponent({
  name: 'GpioChannelEditor',
  props: {
    block: {
      type: Object as PropType<OneWireGpioModuleBlock>,
      required: true,
    },
  },
  emits: ['update:block'],
  setup(props, { emit }) {
    const selectedId = ref<number | null>(null);


    const selectedChannel = computed<GpioModuleChannel | null>(
      () => props.block.data.channels
        .find(c => c.id === selectedId.value)
        ?? null,
    );

    function saveBlock(v: OneWireGpioModuleBlock = props.block): void {
      emit('update:block', v);
    }

    const unassigned = computed<DeviceSlot[]>(
      () => props.block.data.channels
        .filter(c => c.pinsMask === GpioPins.NONE)
        .map(c => ({
          id: c.id,
          name: c.deviceType,
          width: c.width,
          start: -1,
        })),
    );

    const active = computed<DeviceSlot[]>(
      () => props.block.data.channels
        .filter(c => c.pinsMask !== GpioPins.NONE)
        .map(c => ({
          id: c.id,
          name: c.deviceType,
          width: c.width,
          start: startBit(c.pinsMask),
        })),
    );

    const unused = computed<UnusedSlot[]>(
      () => {
        // always set a bit at idx 8
        // this provides an upper boundary when calculating free space
        const mask: number = props.block.data.channels
          .reduce((acc, c) => acc | c.pinsMask, (1 << 8));

        const output: UnusedSlot[] = [];
        for (let i = 0; i <= 8; i++) {
          if (!((1 << i) & mask)) {
            output.push({
              start: i,
              free: startBit(mask >> i),
            });
          }
        }
        return output;
      },
    );

    function clickUnassignedArea(): void {
      const channel = selectedChannel.value;
      if (!channel) {
        return;
      }
      saveBlock({
        ...props.block,
        data: {
          ...props.block.data,
          channels: props.block.data.channels
            .map(c =>
              c.id === channel.id
                ? { ...c, pinsMask: GpioPins.NONE }
                : c,
            ),
        },
          });
    }

    function clickUnassigned(id: number): void {
      if (selectedId.value === id) {
        selectedId.value = null;
      }
      else {
        selectedId.value = id;
      }
    }

    function clickActive(id: number): void {
      if (selectedId.value === id) {
        selectedId.value = null;
      }
      else {
        selectedId.value = id;
      }
    }

    function buildMask(start: number, width: number): number {
      let mask = 0;
      for (let i = 0; i < width; i++) {
        mask |= (1 << (i + start));
      }
      return mask;
    }

    function clickUnused(start: number): void {
      const channel = selectedChannel.value;
      if (!channel) {
        return;
      }
      saveBlock({
        ...props.block,
        data: {
          ...props.block.data,
          channels: props.block.data.channels
            .map(c =>
              c.id === channel.id
                ? { ...c, pinsMask: buildMask(start, channel.width) }
                : c,
            ),
        },
      });
    }

    function unusedId(): number {
      const ids = props.block.data.channels.map(c => c.id);
      let i = 0;
      while (ids.includes(i)) {
        i++;
      }
      return i;
    }

    function addChannel(): void {
      const id = unusedId();
      const channel: GpioModuleChannel = {
        id,
        deviceType: GpioDeviceType.TWO_PIN_SSR,
        pinsMask: GpioPins.NONE,
        width: 2,
        status: ChannelStatus.UNKNOWN,
        config: ChannelConfig.CHANNEL_UNUSED,
        state: DigitalState.STATE_UNKNOWN,
        pwmDuty: 0,
      };
      saveBlock({
        ...props.block,
        data: {
          ...props.block.data,
          channels: [
            ...props.block.data.channels,
            channel,
          ],
        },
      });
    }

    function editChannel(id: number): void {

    }

    function removeChannel(id: number): void {

    }

    return {
      selectedId,
      selectedChannel,
      unassigned,
      active,
      unused,
      clickUnassignedArea,
      clickUnassigned,
      clickActive,
      clickUnused,
      addChannel,
      editChannel,
      removeChannel,
    };
  },
});
</script>

<template>
  <div>
    <div class="row q-gutter-md">
      <q-btn flat label="new" :disable="block.data.channels.length >= 8" @click="addChannel" />
      <q-btn v-if="selectedId != null" flat label="edit" @click="editChannel" />
      <q-btn v-if="selectedId != null" flat label="remove" @click="removeChannel" />
    </div>Unassigned
    <div
      :class="[
        'container unassigned-area',
        selectedId !== null && 'bg-selected'
      ]"
      @click="clickUnassignedArea"
    >
      <div
        v-for="slot in unassigned"
        :key="`unassigned-${slot.start}`"
        :class="['content', selectedId === slot.id && 'bg-selected']"
        :style="{
          gridColumnEnd: `span ${slot.width}`,
        }"
        @click="clickUnassigned(slot.id)"
      >
        {{ slot.name }}
      </div>
    </div>
    Gpio Modules
    <div class="container pins-area">
      <div
        v-for="slot in active"
        :key="`active-${slot.start}`"
        :class="{
          content: true,
          'bg-selected': selectedId === slot.id,
        }"
        :style="`grid-column: ${slot.start + 1} / span ${slot.width}`"
        @click="clickActive(slot.id)"
      >
        {{ slot.name }}
      </div>
      <div
        v-for="slot in unused"
        :key="`unused-${slot.start}`"
        :class="{
          filler: true,
          'bg-selected': selectedChannel && selectedChannel.width <= slot.free,
        }"
        :style="`grid-column: ${slot.start + 1}`"
        @click="clickUnused(slot.start)"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  display: grid
  grid-template-columns: repeat(8, 1fr)
  grid-template-rows: 50px
  grid-auto-flow: dense
  grid-gap: 5px 5px
  padding: 5px
  .content
    border: 1px solid red
  .filler
    border: 1px dotted yellow
.unassigned-area
  min-height: 100px
</style>
