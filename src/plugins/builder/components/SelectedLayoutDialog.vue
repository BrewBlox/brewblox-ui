<script lang="ts">
import { computed, defineComponent } from 'vue';


import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';


@Component
export default class SelectedLayoutDialog extends DialogBase {
  local: BuilderLayout | null = null;

  @Prop({ type: String, default: 'Select layout' })
  public readonly title!: string;

  @Prop({ type: String, required: false })
  public readonly value!: string;

  created(): void {
    this.local = builderStore.layoutById(this.value);
  }

  get layouts(): BuilderLayout[] {
    return builderStore.layouts;
  }

  save(layout: BuilderLayout | null): void {
    this.onDialogOk(layout?.id ?? null);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{title, message, html}">
      <ListSelect
        v-model="local"
        :options="layouts"
        option-value="id"
        option-label="title"
        @confirm="v => save(v)"
      />
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
          @click="save(local)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
