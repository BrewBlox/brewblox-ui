<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, DisplaySettingsBlock, DisplayTempUnit } from '@/plugins/spark/types';
import { UserUnits } from '@/plugins/spark/types';

const defaultMessage = `
    The unit is part of the name in graph fields. <br>
    If you change the unit, you need to update the graph field. <br> <br>
    For example, <b>Setpoint/value[degC]</b> becomes <b>Setpoint/value[degF]</b>. <br> <br>
    The old field will disappear from the graph options after 24h.
     `;

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

  @Prop({ type: String, default: defaultMessage })
  public readonly message!: string;

  @Prop({ type: Boolean, default: true })
  public readonly html!: boolean;

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
