<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { blockTypes, DisplaySettingsBlock, DisplayTempUnit } from '@/plugins/spark/block-types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { UserUnits } from '@/plugins/spark/types';

const defaultMessage =
  `When changing the UI temperature unit, you will need to update existing graphs.
  The old name will disappear after 24h.`;

@Component
export default class SparkUnitMenu extends DialogBase {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, default: 'Spark units' })
  public readonly title!: string;

  @Prop({ type: String, default: defaultMessage })
  public readonly message!: string;

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get units(): UserUnits {
    return this.sparkModule.units;
  }

  get displayBlock(): DisplaySettingsBlock | null {
    return this.sparkModule
      .blocks
      .find(v => v.type === blockTypes.DisplaySettings)
      ?? null;
  }

  get displayTemp(): DisplayTempUnit {
    return this.displayBlock?.data.tempUnit ?? DisplayTempUnit.Celsius;
  }

  set displayTemp(v: DisplayTempUnit) {
    if (this.displayBlock) {
      this.displayBlock.data.tempUnit = v;
      this.sparkModule.saveBlock(this.displayBlock);
    }
  }

  get serviceTemp(): string {
    return this.units.Temp;
  }

  set serviceTemp(v: string) {
    this.units.Temp = v;
    this.sparkModule.saveUnits(this.units);
  }

}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="onDialogOk"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-model="serviceTemp"
        :options="[{ label: 'Celsius', value: 'degC' }, { label: 'Fahrenheit', value: 'degF' }]"
        label="UI temperature unit"
        map-options
        emit-value
        @keyup.enter.exact.stop
      />
      <q-select
        v-model="displayTemp"
        :options="[{ label: 'Celsius', value: 0 }, { label: 'Fahrenheit', value: 1 }]"
        label="Spark Display temperature unit"
        map-options
        emit-value
        @keyup.enter.exact.stop
      />
      <template #actions>
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
