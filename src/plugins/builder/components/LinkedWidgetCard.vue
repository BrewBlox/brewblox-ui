<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { dashboardStore, PersistentWidget } from '@/store/dashboards';
import { Service, serviceStore } from '@/store/services';

import PartCard from './PartCard';

@Component
export default class LinkedWidgetCard extends PartCard {

  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Array, required: true })
  public readonly types!: string[];

  @Prop({ type: String, default: 'Widget' })
  public readonly label!: string;

  @Prop({ type: Function })
  readonly filter!: (widget: PersistentWidget) => boolean;

  get sparkServices(): Service[] {
    return serviceStore.serviceValues
      .filter(svc => svc.type === 'Spark');
  }

  get linked(): string | null {
    return get(this.part.settings, this.settingsKey, null);
  }

  set linked(val: string | null) {
    this.savePartSettings({
      ...this.part.settings,
      [this.settingsKey]: val,
    });
  }

  get broken(): boolean {
    return this.linked !== null && !dashboardStore.widgetIds.includes(this.linked);
  }

  get linkedOpts(): SelectOption[] {
    return dashboardStore.widgetValues
      .filter(this.actualFilter)
      .sort(objectStringSorter('title'))
      .map(widget => ({
        label: `[${dashboardStore.dashboardById(widget.dashboard).title}] ${widget.title}`,
        value: widget.id,
      }));
  }

  get actualFilter(): (widget: PersistentWidget) => boolean {
    if (this.filter) {
      return this.filter;
    }
    return widget => this.types.includes(widget.feature);
  }
}
</script>

<template>
  <q-list>
    <q-separator />
    <q-item>
      <q-item-section>
        <q-select
          v-model="linked"
          :options="linkedOpts"
          :label="label"
          :error="broken"
          clearable
          map-options
          emit-value
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template #error>
            <div>Link broken: widget not found</div>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
  </q-list>
</template>
