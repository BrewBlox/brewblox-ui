<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { userUnits } from '@/user-settings';
import { fixedNumber, prettyQty, prettyUnit } from '@/utils/quantity';
import { ReferenceKind, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/SetpointDriverDisplay';
import { usePart, useSettingsBlock } from '../composables';
import { DriverBlockT, DRIVER_KEY, DRIVER_TYPES } from '../const';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'SetpointDriverDisplayPartComponent',
  setup() {
    const sparkStore = useSparkStore();
    const { flows, width, height, bordered, passthrough, placeholder } =
      usePart.setup();

    const color = computed<string>(() => liquidBorderColor(flows.value));

    const {
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<DriverBlockT>(DRIVER_KEY, DRIVER_TYPES);

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

    const setting = computed<number | null>(() => {
      if (placeholder) {
        return 8;
      }
      return block.value?.data.setting.value ?? null;
    });

    const appliedSetting = computed<number | null>(() => {
      if (placeholder) {
        return 26;
      }
      if (refAmount.value == null || setting.value == null) {
        return null;
      }
      return refAmount.value + setting.value;
    });

    const tempUnit = computed<string>(() =>
      prettyUnit(userUnits.value.temperature),
    );

    return {
      DEFAULT_SIZE,
      MAX_SIZE,
      MIN_SIZE,
      ReferenceKind,
      prettyQty,
      fixedNumber,
      width,
      height,
      bordered,
      passthrough,
      block,
      blockStatus,
      isBroken,
      placeholder,
      showBlockDialog,
      showBlockSelectDialog,
      refKind,
      setting,
      appliedSetting,
      tempUnit,
      color,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 50"
  >
    <g class="content">
      <BrokenSvgIcon
        v-if="isBroken"
        x="30"
      />
      <UnlinkedSvgIcon
        v-else-if="!block && !placeholder"
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
    <BuilderBorder
      v-if="bordered"
      :width="100"
      :color="color"
    />
    <BuilderInteraction
      :width="100"
      @interact="showBlockDialog"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <BlockMenuContent
            :available="!!block"
            @show="showBlockDialog"
            @assign="showBlockSelectDialog"
          />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
