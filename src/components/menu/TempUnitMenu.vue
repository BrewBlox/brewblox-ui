<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, DisplaySettingsBlock, DisplayTempUnit } from '@/plugins/spark/types';
import { UserUnits } from '@/plugins/spark/types';
import { TiltService } from '@/plugins/tilt/types';
import { serviceStore } from '@/store/services';

type ServiceTempUnit = UserUnits['Temp'];

const unitTable: Record<ServiceTempUnit, DisplayTempUnit> = {
  degC: DisplayTempUnit.TEMP_CELSIUS,
  degF: DisplayTempUnit.TEMP_FAHRENHEIT,
};

@Component
export default class TempUnitMenu extends DialogBase {
  unitOpts: SelectOption<ServiceTempUnit>[] = [
    { label: 'Celsius', value: 'degC' },
    { label: 'Fahrenheit', value: 'degF' },
  ]

  tab: 'Spark' | 'Tilt' = 'Spark';

  @Prop({ type: String, default: 'Temperature units' })
  public readonly title!: string;

  get sparkModules(): SparkServiceModule[] {
    return sparkStore.modules;
  }

  get tiltServices(): TiltService[] {
    return serviceStore
      .services
      .filter(v => v.type === 'Tilt');
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

  setTiltUnit(service: TiltService, unit: ServiceTempUnit): void {
    service.config.tempUnit = unit;
    serviceStore.saveService(service);
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
      <q-tabs v-model="tab" dense active-color="primary" align="justify" narrow-indicator>
        <q-tab name="Spark" label="Spark" />
        <q-tab name="Tilt" label="Tilt" :disable="!tiltServices.length" />
      </q-tabs>

      <q-tab-panels v-model="tab">
        <q-tab-panel name="Spark">
          <p>
            Choose temperature units for your services. <br>
            This will affect how temperatures are displayed and logged.
          </p>
          <p>
            Spark data with different units is logged under different field names to distinguish the values. <br>
            After changing a unit, you will need to select different fields in your Graph and Metrics widgets.
          </p>

          <LabeledField
            v-for="module in sparkModules"
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
        </q-tab-panel>

        <q-tab-panel name="Tilt">
          <p>
            Choose temperature units for your services. <br>
            This will affect how temperatures are displayed.
          </p>
          <p>
            Tilt history data always includes both Celsius and Fahrenheit. <br>
            Reload the page to apply the change to Tilt widgets.
          </p>

          <LabeledField
            v-for="service in tiltServices"
            :key="service.id"
            :label="`Tilt service '${service.id}'`"
          >
            <q-btn-toggle
              :value="service.config.tempUnit"
              :options="unitOpts"
              unelevated
              no-caps
              @input="v => setTiltUnit(service, v)"
            />
          </LabeledField>
        </q-tab-panel>
      </q-tab-panels>


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
