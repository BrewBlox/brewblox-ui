<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';


@Component
export default class SelectedLayoutDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: String, default: 'Select layout' })
  public readonly title!: string;

  @Prop({ type: String, required: false })
  public readonly value!: string;

  created(): void {
    this.local = this.value ?? null;
  }

  get layout(): BuilderLayout | null {
    return builderStore.layoutById(this.local);
  }

  get layouts(): BuilderLayout[] {
    return builderStore.layouts;
  }

  selectLayout(id: string | null, saveNow = false): void {
    if (saveNow) {
      this.local = id;
      this.save();
    }
    else {
      this.local = this.local !== id ? id : null;
    }
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="q-pa-md q-gutter-y-sm">
        <div
          v-for="v in layouts"
          :key="v.id"
          :class="[
            'col clickable q-pa-sm rounded-borders text-h6 row q-gutter-x-sm',
            v.id === local && 'depth-24',
          ]"
          @click="selectLayout(v)"
          @dblclick="selectLayout(v, true)"
        >
          {{ v.title }}
        </div>
      </div>
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
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
