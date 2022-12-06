<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { userUnits } from '@/user-settings';
import { fixedNumber, prettyQty, prettyUnit } from '@/utils/quantity';
import { ReferenceKind, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';
import { DriverBlockT, DRIVER_KEY, DRIVER_TYPES } from '../const';

export default defineComponent({
  name: 'SetpointDriverDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { bordered } = usePart.setup(props.part);

    const { block, blockStatus, isBroken, showBlockDialog } =
      useSettingsBlock.setup<DriverBlockT>(
        props.part,
        DRIVER_KEY,
        DRIVER_TYPES,
      );

    const refBlock = computed<SetpointSensorPairBlock | null>(() =>
      block.value !== null
        ? sparkStore.blockById(
            block.value.serviceId,
            block.value.data.referenceId.id,
          )
        : null,
    );

    const refKind = computed<ReferenceKind>(
      () =>
        block.value?.data.referenceSettingOrValue ?? ReferenceKind.REF_SETTING,
    );

    const refAmount = computed<number | null>(() => {
      if (!block.value || !refBlock.value) {
        return null;
      }
      return refKind.value === ReferenceKind.REF_SETTING
        ? refBlock.value.data.setting.value
        : refBlock.value.data.value.value;
    });

    const setting = computed<number | null>(
      () => block.value?.data.setting.value ?? null,
    );

    const appliedSetting = computed<number | null>(() => {
      if (refAmount.value == null || setting.value == null) {
        return null;
      }
      return refAmount.value + setting.value;
    });

    const tempUnit = computed<string>(() =>
      prettyUnit(userUnits.value.temperature),
    );

    return {
      ReferenceKind,
      prettyQty,
      fixedNumber,
      bordered,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      refKind,
      setting,
      appliedSetting,
      tempUnit,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 50"
    class="interaction"
    @click="showBlockDialog"
  >
    <rect class="interaction-background" />
    <g class="content">
      <BrokenSvgIcon
        v-if="isBroken"
        x="30"
      />
      <UnlinkedSvgIcon
        v-else-if="!block"
        x="30"
      />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <SetpointSvgIcon
          v-if="refKind === ReferenceKind.REF_SETTING"
          x="14"
          y="5"
          width="20"
          height="20"
        />
        <SensorSvgIcon
          v-if="refKind === ReferenceKind.REF_VALUE"
          x="14"
          y="5"
          width="20"
          height="20"
        />
        <text
          x="42"
          y="20"
          width="5"
          height="5"
        >
          +
        </text>
        <foreignObject
          x="50"
          y="5"
          width="50"
          height="20"
        >
          <div
            class="fit builder-text"
            style="vertical-align: baseline"
          >
            {{ fixedNumber(setting, 1) }}
            <small>{{ tempUnit }}</small>
          </div>
        </foreignObject>
        <text
          x="42"
          y="40"
          width="5"
          height="5"
        >
          =
        </text>
        <foreignObject
          x="50"
          y="25"
          width="50"
          height="20"
        >
          <div
            class="fit builder-text"
            style="vertical-align: baseline"
          >
            {{ fixedNumber(appliedSetting, 1) }}
            <small>{{ tempUnit }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="100 - 2"
        :height="50 - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </svg>
</template>
