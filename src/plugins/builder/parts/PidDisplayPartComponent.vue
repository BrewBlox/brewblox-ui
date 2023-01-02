<script lang="ts">
import {
  COLD_WATER,
  HEIGHT_KEY,
  HOT_WATER,
  PidBlockT,
  PID_KEY,
  PID_TYPES,
  WIDTH_KEY,
} from '@/plugins/builder/const';
import { liquidBorderColor, textTransformation } from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { userUnits } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { preciseNumber, prettyUnit } from '@/utils/quantity';
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { Block, BlockType } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { usePart, useSettingsBlock } from '../composables';

export default defineComponent({
  name: 'PidDisplayPartComponent',
  setup() {
    const sparkStore = useSparkStore();
    const {
      part,
      patchSettings,
      partWidth,
      partHeight,
      width,
      height,
      bordered,
    } = usePart.setup();

    const color = computed<string>(() => liquidBorderColor(part.value));

    const {
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<PidBlockT>(PID_KEY, PID_TYPES);

    const contentTransform = computed<string>(() =>
      textTransformation(part.value, [1, 1]),
    );

    const outputValue = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.outputValue : null,
    );

    const outputSetting = computed<number | null>(() =>
      block.value?.data.enabled ? block.value.data.outputSetting : null,
    );

    const kp = computed<number | null>(
      () => block.value?.data.kp.value ?? null,
    );

    const target = computed<Block | null>(() =>
      sparkStore.blockById(
        block.value?.serviceId,
        block.value?.data.outputId.id,
      ),
    );

    const targetingOffset = computed<boolean>(() =>
      isBlockCompatible(target.value, BlockType.ActuatorOffset),
    );

    const suffix = computed<string>(() => {
      const setting = outputSetting.value;
      if (setting == null) {
        return '';
      }
      if (targetingOffset.value) {
        return prettyUnit(userUnits.value.temperature);
      }
      return '%';
    });

    function showSizeDialog(): void {
      createDialog({
        component: 'AreaSizeDialog',
        componentProps: {
          title: 'Part size',
          message: 'The part is scaled to fit the new dimensions.',
          modelValue: {
            width: partWidth.value,
            height: partHeight.value,
          },
          min: { width: 1, height: 1 },
          max: { width: 5, height: 5 },
        },
      }).onOk(({ width, height }: AreaSize) => {
        patchSettings({
          [WIDTH_KEY]: width,
          [HEIGHT_KEY]: height,
        });
      });
    }

    return {
      HOT_WATER,
      COLD_WATER,
      preciseNumber,
      mdiCalculatorVariant,
      mdiPlusMinus,
      contentTransform,
      width,
      height,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
      outputValue,
      outputSetting,
      kp,
      target,
      suffix,
      color,
      bordered,
      showSizeDialog,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <g
      :transform="contentTransform"
      class="content"
    >
      <BrokenSvgIcon v-if="isBroken" />
      <UnlinkedSvgIcon v-else-if="!block" />
      <template v-else>
        <BlockStatusSvg :status="blockStatus" />
        <HeatingSvgIcon
          v-if="kp && kp > 0"
          :color="outputValue ? HOT_WATER : 'white'"
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <CoolingSvgIcon
          v-else
          :color="outputValue ? COLD_WATER : 'white'"
          x="12.5"
          y="5"
          width="25"
          height="25"
        />
        <foreignObject
          y="30"
          width="50"
          height="15"
        >
          <div class="fit builder-text">
            {{ preciseNumber(outputSetting) }}
            <small v-if="outputSetting != null">{{ suffix }}</small>
          </div>
        </foreignObject>
      </template>
    </g>
    <BuilderBorder
      v-if="bordered"
      :color="color"
    />
    <BuilderInteraction @interact="showBlockDialog">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            :disable="!block"
            clickable
            @click="showBlockDialog"
          >
            <q-item-section>Show block</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            clickable
            @click="showBlockSelectDialog"
          >
            <q-item-section>Assign block</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            clickable
            @click="showSizeDialog"
          >
            <q-item-section>Edit size</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
