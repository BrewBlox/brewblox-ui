<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';

// import { OneWireGpioModuleBlock } from '@/shared-types';

interface DeviceOpt {
  name: string;
  length: number;
}

interface DeviceSlot extends DeviceOpt {
  start: number;
}

const deviceOpts: DeviceOpt[] = [
  { name: '1-pin', length: 1 },
  { name: '2-pin', length: 2 },
  { name: '3-pin', length: 3 },
  { name: '4-pin', length: 4 },
];

const empty: DeviceOpt = { name: '', length: 1 };

export default defineComponent({
  name: 'GpioChannelEditor',
  props: {
    // block: {
    //   type: Object as PropType<OneWireGpioModuleBlock>,
    //   required: true,
    // },
  },
  setup() {

    const unassigned = reactive<DeviceSlot[]>([]);

    const slots1 = reactive<DeviceSlot[]>(
      [
        { ...deviceOpts[0], start: 2 },
        { ...deviceOpts[2], start: 3 },
        { ...deviceOpts[1], start: 7 },
      ],
    );

    const fillCount1 = computed<number>(
      () => 8 - slots1.reduce((acc: number, slot: DeviceSlot) => acc + slot.length, 0),
    );

    const slots2 = reactive<DeviceSlot[]>(
      [
        { ...deviceOpts[3], start: 1 },
        { ...deviceOpts[2], start: 5 },
      ],
    );

    const fillCount2 = computed<number>(
      () => 8 - slots2.reduce((acc: number, slot: DeviceSlot) => acc + slot.length, 0),
    );

    function clickSlot1(idx: number): void {
      const [v] = slots1.splice(idx, 1);
      unassigned.push(v);
    }

    function clickUnassigned(idx: number): void {
      const [v] = unassigned.splice(idx, 1);
      slots1.push(v);
    }

    return {
      deviceOpts,
      unassigned,
      slots1,
      slots2,
      fillCount1,
      fillCount2,
      clickSlot1,
      clickUnassigned,
    };
  },
});
</script>

<template>
  <div>
    Unassigned
    <div class="container unassigned-area">
      <div
        v-for="(slot, idx) in unassigned"
        :key="`slot-0-${slot.start}`"
        class="content"
        :style="`grid-column-end: span ${slot.length}`"
        @click="clickUnassigned(idx)"
      >
        {{ slot.name }}
      </div>
    </div>
    Gpio Modules
    <div class="container pins-area">
      <div
        v-for="(slot, idx) in slots1"
        :key="`slot-1-${slot.start}`"
        class="content"
        :style="`grid-column: ${slot.start} / span ${slot.length}`"
        @click="clickSlot1(idx)"
      >
        {{ slot.name }}
      </div>
      <div
        v-for="idx in fillCount1"
        :key="`filler-1-${idx}`"
        class="filler"
      />
    </div>
    <div class="container pins-area">
      <div
        v-for="slot in slots2"
        :key="`slot-2-${slot.start}`"
        class="content"
        :style="`grid-column: ${slot.start} / span ${slot.length}`"
      >
        {{ slot.name }}
      </div>
      <div
        v-for="idx in fillCount2"
        :key="`filler-2-${idx}`"
        class="filler"
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
