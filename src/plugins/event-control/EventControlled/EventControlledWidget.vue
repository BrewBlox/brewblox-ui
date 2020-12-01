<script lang="ts">
import shortid from 'shortid';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { eventControlStore } from '@/plugins/event-control/store';

import {
  EventControlDevice,
  EventControlDeviceState,
} from '../types';
import EventControlledDialog from './EventControlledDialog.vue';
import { EventControlledConfig, StateValue } from './types';

function optSetting<T>(key: string, field: T | Mapped<T> | undefined): T | null {
  if (field instanceof Array) {
    return field as T;
  }
  const actual = (field instanceof Object)
    ? field[key]
    : field;
  return actual ?? null;
}

@Component({
  components: {
    EventControlledDialog,
  },
})
export default class EventControlledWidget extends WidgetBase<EventControlledConfig> {

  get deviceId(): string | null {
    return this.config.deviceId;
  }

  set deviceId(value: string | null) {
    this.config.deviceId = value;
    this.saveConfig();
  }

  get deviceOpts(): SelectOption[] {
    return eventControlStore
      .devices
      .map(v => ({ value: v.id, label: v.title || v.id }));
  }

  get device(): EventControlDevice | null {
    return eventControlStore.deviceById(this.deviceId);
  }

  get editable(): boolean {
    return this.device?.editable ?? false;
  }

  get deviceState(): EventControlDeviceState | null {
    return eventControlStore.stateById(this.deviceId);
  }

  get stateValues(): StateValue[] {
    return this.device
      ?.fields
      .map(key => {
        const device = this.device!;
        const value = this.deviceState?.values[key] ?? null;
        const inferredType = (typeof (value ?? 0)) as 'number' | 'string';

        return {
          id: shortid.generate(),
          key,
          value,
          label: optSetting(key, device.valueName) ?? key,
          type: optSetting(key, device.valueType) ?? inferredType,
          unit: optSetting(key, device.unit) ?? '',
          range: optSetting(key, device.range),
          precision: optSetting(key, device.precision),
          choices: optSetting(key, device.choices),
        };
      })
      ?? [];
  }

  editValues(): void {
    createDialog({
      component: EventControlledDialog,
      device: this.device,
      values: this.stateValues,
      title: 'Edit device',
    })
      .onOk((updated: StateValue[]) => {
        if (!this.device || !this.deviceState) {
          return;
        }

        const { id, values } = this.deviceState;
        const desiredValues = updated.reduce(
          (obj, v) => ({ ...obj, [v.key]: v.value }), {});

        eventControlStore.changeState({ id, values, desiredValues });
      });
  }

}
</script>


<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!deviceId">
        <template #message>
          <span>Device not set</span>
        </template>
      </CardWarning>
      <CardWarning v-else-if="!device">
        <template #message>
          <span>Device <i>{{ deviceId }}</i> not found</span>
        </template>
      </CardWarning>
      <CardWarning v-else-if="!deviceState">
        <template #message>
          <span>Device <i>{{ deviceId }}</i> has no active state</span>
        </template>
      </CardWarning>

      <div
        v-if="mode === 'Basic'"
        class="widget-body column"
      >
        <div
          :class="[
            'row',
            editable && 'clickable q-pa-sm rounded-borders'
          ]"
          @click="editValues"
        >
          <LabeledField
            v-for="v in stateValues"
            :key="v.id"
            :label="v.label"
            class="col-grow min-width-md"
          >
            <template v-if="v.type === 'number' && v.precision !== null">
              {{ v.value | round(v.precision) }} {{ v.unit }}
            </template>
            <template v-else>
              {{ v.value }} {{ v.unit }}
            </template>
          </LabeledField>
        </div>
      </div>

      <div
        v-if="mode === 'Full'"
        class="widget-body row"
      >
        <SelectField
          v-model="deviceId"
          :options="deviceOpts"
          title="Device"
          label="Device"
          class="col-grow"
        />
      </div>
    </div>
  </CardWrapper>
</template>
