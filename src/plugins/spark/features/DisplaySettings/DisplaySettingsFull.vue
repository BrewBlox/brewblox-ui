<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import { makeTypeFilter } from '@/utils/functional';
import { isLink } from '@/utils/identity';
import { bloxLink } from '@/utils/link';
import {
  BlockIntfType,
  BlockOrIntfType,
  BlockType,
  DisplaySettingsBlock,
  DisplaySlot,
  Link,
  SysInfoBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

const slotNameRules: InputRule[] = [
  (v) => !v || v.length <= 15 || 'Name can only be 15 characters',
];
const footerRules: InputRule[] = [
  (v) => !v || v.length <= 40 || 'Footer text can only be 40 characters',
];
const validTypes: BlockOrIntfType[] = [
  BlockIntfType.TempSensorInterface,
  BlockIntfType.TempSensorInterface,
  BlockIntfType.SetpointSensorPairInterface,
  BlockIntfType.ActuatorAnalogInterface,
  BlockType.Pid,
];

const sysInfoFilter = makeTypeFilter<SysInfoBlock>(BlockType.SysInfo);

export default defineComponent({
  name: 'DisplaySettingsFull',
  setup() {
    const { serviceId, block, patchBlock } =
      useBlockWidget.setup<DisplaySettingsBlock>();
    const sparkStore = useSparkStore();

    const slots = computed<(DisplaySlot | null)[]>(() => {
      const slots = Array(6).fill(null);
      block.value.data.widgets.forEach((w) => {
        slots[w.pos - 1] = w;
      });
      return slots;
    });

    const sysInfo = computed<SysInfoBlock | undefined>(() =>
      sparkStore.blocksByService(serviceId).find(sysInfoFilter),
    );

    const displayBrightness = computed<number>({
      get: () => sysInfo.value?.data.displayBrightness ?? 255,
      set: (displayBrightness) => {
        sparkStore.patchBlock(sysInfo.value, { displayBrightness });
      },
    });

    function slotLink(slot: DisplaySlot | null): Link {
      if (!slot) {
        return bloxLink(null);
      }
      return Object.values(slot).find((v) => isLink(v)) ?? bloxLink(null);
    }

    function slotColor(slot: DisplaySlot | null): string {
      return slot?.color ? `#${slot.color}` : '#ff';
    }

    function slotColorStyle(slot: DisplaySlot): Mapped<string> {
      const color = `#${slot?.color || 'ff'}`;
      return {
        color,
        backgroundColor: color,
      };
    }

    async function updateSlotLink(idx: number, link: Link): Promise<void> {
      const pos = idx + 1;
      if (!link.id) {
        return patchBlock({
          widgets: block.value.data.widgets.filter((w) => w.pos !== pos),
        });
      }

      const { type } = link;
      if (!type) {
        return;
      }

      const existing = slots.value[idx];
      const obj: DisplaySlot = {
        pos,
        name: existing?.name || link.id.slice(0, 15),
        color: existing?.color || '4169E1',
      };

      obj.name = await new Promise((resolve) => {
        createDialog({
          component: 'InputDialog',
          componentProps: {
            modelValue: obj.name,
            title: 'Choose label text',
            label: `Label for block '${link.id}'`,
            rules: slotNameRules,
          },
        })
          .onOk((v) => resolve(v))
          .onCancel(() => resolve(obj.name))
          .onDismiss(() => resolve(obj.name));
      });

      if (isCompatible(type, BlockIntfType.TempSensorInterface)) {
        obj.tempSensor = link;
      } else if (
        isCompatible(type, BlockIntfType.SetpointSensorPairInterface)
      ) {
        obj.setpointSensorPair = link;
      } else if (isCompatible(type, BlockIntfType.ActuatorAnalogInterface)) {
        obj.actuatorAnalog = link;
      } else if (isCompatible(type, BlockType.Pid)) {
        obj.pid = link;
      }

      return patchBlock({
        widgets: [
          ...block.value.data.widgets.filter((w) => w.pos !== pos),
          obj,
        ],
      });
    }

    function updateSlotName(idx: number, name: string): void {
      const pos = idx + 1;
      patchBlock({
        widgets: block.value.data.widgets.map((w) =>
          w.pos === pos ? { ...w, name } : w,
        ),
      });
    }

    function updateSlotColor(idx: number, color: string): void {
      const pos = idx + 1;
      patchBlock({
        widgets: block.value.data.widgets.map((w) =>
          w.pos === pos ? { ...w, color: color.replace('#', '') } : w,
        ),
      });
    }

    return {
      footerRules,
      slotNameRules,
      validTypes,
      serviceId,
      block,
      displayBrightness,
      patchBlock,
      slots,
      slotLink,
      slotColor,
      slotColorStyle,
      updateSlotLink,
      updateSlotName,
      updateSlotColor,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <q-card-section class="q-gutter-y-sm">
      <div class="grid-container">
        <div
          v-for="(slot, idx) in slots"
          :key="`display-slot-${idx}`"
          :style="`border: 2px solid ${slotColor(
            slot,
          )}; grid-column-end: span 1`"
          class="q-pa-sm column q-gutter-y-xs"
        >
          <LinkField
            :model-value="slotLink(slot)"
            :service-id="serviceId"
            :compatible="validTypes"
            :show="false"
            title="Block"
            label="Block"
            @update:model-value="(v) => updateSlotLink(idx, v)"
          />
          <template v-if="slot">
            <InputField
              :model-value="slot.name"
              :rules="slotNameRules"
              label="Label text"
              title="Label text"
              message="Choose the LCD display label text for this block"
              @update:model-value="(v) => updateSlotName(idx, v)"
            />
            <ColorField
              :model-value="slot.color"
              title="Color"
              label="Color"
              message="Choose the LCD display background color for this block"
              @update:model-value="(v) => updateSlotColor(idx, v)"
            />
          </template>
        </div>
      </div>

      <div class="row q-gutter-sm">
        <InputField
          :model-value="block.data.name"
          :rules="footerRules"
          class="col-grow"
          label="Footer text"
          title="footer text"
          @update:model-value="(v) => patchBlock({ name: v })"
        />
        <q-field
          label="Display brightness"
          stack-label
          borderless
          class="col-grow min-width-md"
        >
          <q-slider
            v-model="displayBrightness"
            label
            :min="20"
            :max="255"
          />
        </q-field>
      </div>
    </q-card-section>
  </div>
</template>

<style scoped lang="sass">
.grid-container
  display: grid
  grid-template-columns: repeat(3, 1fr)
  grid-row-gap: 10px
  grid-column-gap: 10px
</style>
