<script lang="ts">
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid } from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { makeTypeFilter } from '@/utils/functional';
import { contrastColor } from '@/utils/misc';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import {
  mdiBullseyeArrow,
  mdiSwapVerticalBold,
  mdiThermometer,
} from '@quasar/extras/mdi-v5';
import {
  BlockType,
  PidBlock,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { useSettingsBlock } from '../composables';

const pidFilter = makeTypeFilter<PidBlock>(BlockType.Pid);

export default defineComponent({
  name: 'SetpointValues',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    startX: {
      type: Number,
      default: 0,
    },
    startY: {
      type: Number,
      default: 0,
    },
    hideUnset: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();
    const { address, block, isBroken } =
      useSettingsBlock.setup<SetpointSensorPairBlock>(
        props.part,
        props.settingsKey,
        [BlockType.SetpointSensorPair],
      );
    const { serviceId } = address.value;

    const textColor = computed<string>(() =>
      props.backgroundColor ? contrastColor(props.backgroundColor) : 'white',
    );

    const isUsed = computed<boolean>(
      () =>
        block.value !== null &&
        block.value.data.enabled &&
        sparkStore
          .blocksByService(serviceId)
          .filter(pidFilter)
          .some((blk) => blk.data.inputId.id === address.value.id),
    );

    const isClaimed = computed<boolean>(() =>
      sparkStore
        .claimsByService(serviceId)
        .some((c) => c.target === block.value?.id),
    );

    const setpointSetting = computed<number | null>(() =>
      block.value && isUsed.value ? block.value.data.storedSetting.value : null,
    );

    const setpointValue = computed<number | null>(
      () => block.value?.data.value.value ?? null,
    );

    const setpointUnit = computed<string>(() =>
      prettyUnit(block.value?.data.storedSetting),
    );

    return {
      mdiThermometer,
      mdiSwapVerticalBold,
      mdiBullseyeArrow,
      coord2grid,
      fixedNumber,
      textColor,
      block,
      isBroken,
      isClaimed,
      setpointSetting,
      setpointValue,
      setpointUnit,
    };
  },
});
</script>

<template>
  <g
    v-if="block || !hideUnset"
    :transform="`translate(${coord2grid(startX)}, ${coord2grid(startY)})`"
  >
    <SvgEmbedded
      :width="coord2grid(2)"
      :height="coord2grid(1)"
    >
      <BrokenIcon
        v-if="isBroken"
        class="col"
      />
      <UnlinkedIcon
        v-else-if="!block"
        class="col"
      />
      <div
        v-else
        class="col column q-ma-xs"
        :style="{ color: textColor }"
      >
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="mdiThermometer"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ fixedNumber(setpointValue, 1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="isClaimed ? mdiSwapVerticalBold : mdiBullseyeArrow"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ fixedNumber(setpointSetting, 1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
      </div>
    </SvgEmbedded>
  </g>
</template>
