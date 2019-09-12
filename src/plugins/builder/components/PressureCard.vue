<script lang="ts">
import { debounce } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class PressureCard extends PartCard {
  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Number, required: true })
  public readonly defaultValue!: number;

  @Prop({ type: Number, required: true })
  public readonly min!: number;

  @Prop({ type: Number, required: true })
  public readonly max!: number;

  get value(): number {
    return this.part.settings[this.settingsKey] || this.defaultValue;
  }

  save(val: number): void {
    const pressure = val || this.defaultValue;
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: pressure });
  }

  debouncedSave = debounce(this.save, 50, true)

  reset(): void {
    this.debouncedSave(this.defaultValue);
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-item-label caption>
          Pressure
        </q-item-label>
        <q-slider :value="value" :min="min" :max="max" dark @change="debouncedSave" />
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn icon="mdi-backup-restore" flat round size="sm" @click="reset">
          <q-tooltip>
            Reset to default
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>
