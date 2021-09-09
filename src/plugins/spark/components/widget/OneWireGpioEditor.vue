<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { GpioDeviceType, GpioModuleChannel, GpioPins } from '@/shared-types';
import { createDialog } from '@/utils/dialog';

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
  return n > 0 ? Math.log2(n & -n) : -1;
}

export default defineComponent({
  name: 'OneWireGpioEditor',
  props: {
    channels: {
      type: Array as PropType<GpioModuleChannel[]>,
      required: true,
    },
  },
  emits: ['update:channels'],
  setup(props, { emit }) {
    const selectedId = ref<number | null>(null);

    const selectedChannel = computed<GpioModuleChannel | null>(
      () => props.channels.find((c) => c.id === selectedId.value) ?? null,
    );

    function saveChannels(channels: GpioModuleChannel[]): void {
      emit('update:channels', channels);
    }

    const unassigned = computed<DeviceSlot[]>(() =>
      props.channels
        .filter((c) => c.pinsMask === GpioPins.NONE)
        .map((c) => ({
          id: c.id,
          name: c.name,
          width: c.width,
          start: -1,
        })),
    );

    const active = computed<DeviceSlot[]>(() =>
      props.channels
        .filter((c) => c.pinsMask !== GpioPins.NONE)
        .map((c) => ({
          id: c.id,
          name: c.name,
          width: c.width,
          start: startBit(c.pinsMask),
        })),
    );

    const unused = computed<UnusedSlot[]>(() => {
      // always set a bit at idx 8
      // this provides an upper boundary when calculating free space
      const mask: number = props.channels.reduce(
        (acc, c) => acc | c.pinsMask,
        1 << 8,
      );

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
    });

    function clickUnassignedArea(): void {
      const channel = selectedChannel.value;
      if (!channel) {
        return;
      }
      saveChannels(
        props.channels.map((c) =>
          c.id === channel.id ? { ...c, pinsMask: GpioPins.NONE } : c,
        ),
      );
      selectedId.value = null;
    }

    function clickUnassigned(id: number): void {
      if (selectedId.value === id) {
        selectedId.value = null;
      } else {
        selectedId.value = id;
      }
    }

    function clickActive(id: number): void {
      if (selectedId.value === id) {
        selectedId.value = null;
      } else {
        selectedId.value = id;
      }
    }

    function buildMask(start: number, width: number): number {
      let mask = 0;
      for (let i = 0; i < width; i++) {
        mask |= 1 << (i + start);
      }
      return mask;
    }

    function clickUnused(slot: UnusedSlot): void {
      const channel = selectedChannel.value;
      if (!channel || channel.width > slot.free) {
        return;
      }
      saveChannels(
        props.channels.map((c) =>
          c.id === channel.id
            ? { ...c, pinsMask: buildMask(slot.start, channel.width) }
            : c,
        ),
      );
      selectedId.value = null;
    }

    function unusedId(): number {
      const ids = props.channels.map((c) => c.id);
      let i = 1;
      while (ids.includes(i)) {
        i++;
      }
      return i;
    }

    function modifyChannel(channel: GpioModuleChannel): void {
      createDialog({
        component: 'GpioChannelDialog',
        componentProps: {
          title: 'Edit channel',
          channel,
        },
      }).onOk((updated: GpioModuleChannel) => {
        saveChannels([
          ...props.channels.filter((c) => c.id !== updated.id),
          updated,
        ]);
      });
    }

    function addChannel(): void {
      const id = unusedId();
      const channel: GpioModuleChannel = {
        id,
        name: `Channel ${id}`,
        deviceType: GpioDeviceType.GPIO_DEV_SSR_2P,
        pinsMask: GpioPins.NONE,
        width: 2,
      };
      modifyChannel(channel);
    }

    function editChannel(): void {
      const channel = selectedChannel.value;
      if (!channel) {
        return;
      }
      modifyChannel(channel);
    }

    function removeChannel(): void {
      const channel = selectedChannel.value;
      if (!channel) {
        return;
      }
      saveChannels(props.channels.filter((c) => c.id !== channel.id));
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
  <div class="column q-gutter-y-sm">
    <div class="row">
      <q-btn
        flat
        label="add channel"
        :disable="channels.length >= 8"
        @click="addChannel"
      />
      <q-btn
        flat
        label="edit channel"
        :disable="selectedId == null"
        @click="editChannel"
      />
      <q-btn
        flat
        label="remove channel"
        :disable="selectedId == null"
        @click="removeChannel"
      />
    </div>
    <!-- Pins -->
    <div class="container pins-area">
      <div
        v-for="slot in active"
        :key="`active-${slot.start}`"
        :class="[
          'content ellipsis',
          {
            'target-clickable': selectedId === slot.id,
          },
        ]"
        :style="{
          gridColumn: `${slot.start + 1} / span ${slot.width}`,
          position: 'relative',
        }"
        @click="clickActive(slot.id)"
      >
        {{ slot.name }}
        <q-tooltip>{{ slot.name }}</q-tooltip>
      </div>
      <div
        v-for="slot in unused"
        :key="`unused-${slot.start}`"
        :class="{
          filler: true,
          'target-clickable':
            selectedChannel && selectedChannel.width <= slot.free,
          'target-invalid':
            selectedChannel && selectedChannel.width > slot.free,
        }"
        :style="{
          gridColumn: `${slot.start + 1}`,
        }"
        @click="clickUnused(slot)"
      />
      <div style="grid-column: 9 / span 2" class="power">
        Power
      </div>
    </div>
    <!-- Unassigned -->
    <div
      v-if="unassigned.length > 0 || selectedId !== null"
      :class="[
        'container unassigned-area',
        {
          'target-clickable':
            selectedChannel !== null && selectedChannel.pinsMask !== 0,
        },
      ]"
      @click="clickUnassignedArea"
    >
      <div
        v-if="unassigned.length === 0"
        class="text-italic darkened"
        style="grid-column-end: span 4"
      >
        Unassigned channels
      </div>
      <div
        v-for="slot in unassigned"
        :key="`unassigned-${slot.start}`"
        :class="[
          'content ellipsis',
          { 'target-clickable': selectedId === slot.id },
        ]"
        :style="{
          gridColumnEnd: `span ${slot.width}`,
        }"
        @click.stop="clickUnassigned(slot.id)"
      >
        {{ slot.name }}
        <q-tooltip>{{ slot.name }}</q-tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  display: grid
  grid-template-columns: repeat(10, 1fr)
  grid-template-rows: 50px
  grid-auto-flow: dense
  grid-gap: 5px 5px
  padding: 5px
  .content
    border: 1px solid white
    overflow: hidden
    padding-top: 2px
    padding-left: 5px
  .filler
    border: 1px dotted $light-green
    overflow: hidden
  .power
    margin-left: 5px
    min-height: 100%
    text-align: center
    overflow: hidden
    border: 1px solid orange
.target-clickable
  background-color: $hover
  cursor: pointer
.target-invalid
  background-color: $red
  opacity: 0.05
  cursor: not-allowed
  border: none
.unassigned-area
  min-height: 100px
  border: 1px dotted $amber
</style>
