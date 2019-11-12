<script lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';

import { typeName } from './getters';
import { SetpointProfileBlock } from './types';

@Component
export default class ProfilePresetDialog extends DialogBase {
  selected: SelectOption | null = null;

  @Prop({ type: Object })
  public readonly value!: SetpointProfileBlock;

  get options(): SelectOption[] {
    return sparkStore.presetValues
      .filter(preset => preset.type === typeName)
      .map(preset => ({ label: preset.name, value: preset.id }));
  }

  removeSelected(): void {
    if (this.selected === null) {
      return;
    }
    const preset = sparkStore.presets[this.selected.value];
    this.selected = null;
    sparkStore.removePreset(preset);
  }

  editSelected(): void {
    if (this.selected === null) {
      return;
    }
    const preset = sparkStore.presets[this.selected.value];
    createDialog({
      title: 'Edit profile name',
      dark: true,
      cancel: true,
      prompt: {
        model: preset.name,
        type: 'text',
      },
    })
      .onOk(name => sparkStore.savePreset({ ...preset, name }));
  }

  async loadSelected(): Promise<void> {
    if (this.selected === null) {
      return;
    }
    const preset = sparkStore.presets[this.selected.value];
    const points = deserialize(cloneDeep(preset.data.points));

    createDialog({
      title: 'Profile start',
      message: `Do you want to change '${this.value.id}' start time to now?`,
      dark: true,
      ok: 'Yes',
      cancel: 'No',
    })
      .onOk(async () => {
        this.value.data.start = new Date().getTime() / 1000;
        this.value.data.points = points;
        await sparkStore.saveBlock([this.value.serviceId, this.value]);
        this.onDialogOk();
      })
      .onCancel(async () => {
        this.value.data.points = points;
        await sparkStore.saveBlock([this.value.serviceId, this.value]);
        this.onDialogOk();
      });
  }

  async saveSelected(): Promise<void> {
    if (this.selected === null) {
      return;
    }
    const preset = sparkStore.presets[this.selected.value];
    preset.data = {
      points: cloneDeep(serialize(this.value.data.points)),
    };
    await sparkStore.savePreset(preset);
    this.onDialogOk();
  }

  createPreset(): void {
    createDialog({
      title: 'Save as new profile',
      dark: true,
      cancel: true,
      prompt: {
        model: `${this.value.id} profile`,
        type: 'text',
      },
    })
      .onOk(async name => {
        await sparkStore.createPreset({
          id: uid(),
          name,
          type: typeName,
          data: {
            points: cloneDeep(serialize(this.value.data.points)),
          },
        });
        this.onDialogOk();
      });
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-item dark>
          <q-item-section>
            <q-select
              v-model="selected"
              :options="options"
              label="Profiles"
              dark
              autofocus
              options-dark
            >
              <template #no-option>
                <q-item dark>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
              <template v-if="!!selected" #after>
                <q-btn flat round icon="edit" @click="editSelected">
                  <q-tooltip>Rename profile</q-tooltip>
                </q-btn>
                <q-btn flat round icon="delete" @click="removeSelected">
                  <q-tooltip>Remove profile</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-space />
        <q-btn :disable="!selected" color="primary" flat label="load" @click="loadSelected" />
        <q-btn :disable="!selected" color="primary" flat label="save" @click="saveSelected" />
        <q-btn color="primary" flat label="New" @click="createPreset" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
