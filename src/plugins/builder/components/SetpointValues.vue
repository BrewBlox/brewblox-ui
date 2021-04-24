<script lang="ts">
import { mdiBullseyeArrow, mdiSwapVerticalBold, mdiThermometer } from '@quasar/extras/mdi-v5';
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '@/plugins/builder/types';
import { squares } from '@/plugins/builder/utils';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, PidBlock, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { prettyUnit } from '@/utils/bloxfield';
import { contrastColor, round, typeMatchFilter } from '@/utils/functional';

import { useSettingsBlock } from '../composables';

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
    const {
      address,
      block,
      isBroken,
    } = useSettingsBlock.setup<SetpointSensorPairBlock>(props.part, props.settingsKey, [BlockType.SetpointSensorPair]);

    const textColor = computed<string>(
      () => props.backgroundColor
        ? contrastColor(props.backgroundColor)
        : 'white',
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(address.value.serviceId),
    );

    const isUsed = computed<boolean>(
      () => block.value !== null
        && block.value.data.settingEnabled
        && sparkModule.value!
          .blocks
          .filter(typeMatchFilter<PidBlock>(BlockType.Pid))
          .some(blk => blk.data.inputId.id === address.value.id),
    );

    const isDriven = computed<boolean>(
      () => block.value !== null
        && sparkModule.value!
          .drivenBlocks
          .includes(block.value.id),
    );

    const setpointSetting = computed<number | null>(
      () => block.value && isUsed.value
        ? block.value.data.storedSetting.value
        : null,
    );

    const setpointValue = computed<number | null>(
      () => block.value?.data.value.value ?? null,
    );

    const setpointUnit = computed<string>(
      () => prettyUnit(block.value?.data.storedSetting),
    );

    return {
      mdiThermometer,
      mdiSwapVerticalBold,
      mdiBullseyeArrow,
      squares,
      round,
      textColor,
      block,
      isBroken,
      isDriven,
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
    :transform="`translate(${squares(startX)}, ${squares(startY)})`"
  >
    <SvgEmbedded
      :width="squares(2)"
      :height="squares(1)"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <div v-else class="col column q-ma-xs" :style="{color: textColor}">
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="mdiThermometer"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ round(setpointValue, 1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="isDriven ? mdiSwapVerticalBold : mdiBullseyeArrow"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ round(setpointSetting, 1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
      </div>
    </SvgEmbedded>
  </g>
</template>
