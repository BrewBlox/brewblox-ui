<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, DisplaySettingsBlock, DisplayTempUnit } from '@/plugins/spark/types';
import { UserUnits } from '@/plugins/spark/types';

type ServiceTempUnit = UserUnits['Temp'];

const unitTable: Record<ServiceTempUnit, DisplayTempUnit> = {
  degC: DisplayTempUnit.TEMP_CELSIUS,
  degF: DisplayTempUnit.TEMP_FAHRENHEIT,
};

@Component
export default class SparkUnitMenu extends DialogBase {
  unitOpts: SelectOption<ServiceTempUnit>[] = [
    { label: 'Celsius', value: 'degC' },
    { label: 'Fahrenheit', value: 'degF' },
  ]

  @Prop({ type: String, default: 'Temperature units' })
  public readonly title!: string;

  get modules(): SparkServiceModule[] {
    return sparkStore.modules;
  }

  findDisplayBlock(module: SparkServiceModule): DisplaySettingsBlock | null {
    return module
      .blocks
      .find(typeMatchFilter<DisplaySettingsBlock>(BlockType.DisplaySettings))
      ?? null;
  }

  getModuleUnit(module: SparkServiceModule): ServiceTempUnit | null {
    const serviceUnit = module.units.Temp;
    const displayUnit = this.findDisplayBlock(module)?.data.tempUnit;

    return unitTable[serviceUnit] === displayUnit
      ? serviceUnit
      : null;
  }

  setModuleUnit(module: SparkServiceModule, unit: ServiceTempUnit): void {
    const block = this.findDisplayBlock(module);
    if (block) {
      block.data.tempUnit = unitTable[unit];
      module.saveUnits({ ...module.units, Temp: unit });
      module.saveBlock(block);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOk"
  >
    <DialogCard v-bind="{title, message, html}">
      <p>
        Choose temperature units for your services. <br>
        This will affect how temperatures are displayed and logged.
      </p>
      <p>
        Data with different units is logged under different field names to distinguish the values. <br>
        After changing a unit, you will need to select different fields in your Graph and Metrics widgets.
      </p>

      <LabeledField
        v-for="module in modules"
        :key="module.id"
        :label="`Spark service '${module.id}'`"
      >
        <q-btn-toggle
          :value="getModuleUnit(module)"
          :options="unitOpts"
          unelevated
          no-caps
          :disable="!module.status.isSynchronized"
          @input="v => setModuleUnit(module, v)"
        />
      </LabeledField>

      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="onDialogOk"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
