<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';


@Component
export default class BuilderLayoutIndex extends Vue {
  dragging = false;

  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  get editing(): boolean {
    return this.value;
  }

  set editing(val: boolean) {
    this.$emit('input', val);
  }

  get layouts(): BuilderLayout[] {
    // avoid modifying the store object
    return [...builderStore.layouts]
      .filter(layout => layout.listed ?? true)
      .sort(objectSorter('order'));
  }

  set layouts(layouts: BuilderLayout[]) {
    builderStore.updateLayoutOrder(layouts.map(v => v.id));
  }

  get builderPath(): string {
    const { path } = this.$route;
    return path.startsWith('/brewery')
      ? path.replace('/brewery', '/builder')
      : '/builder';
  }
}
</script>

<template>
  <div>
    <q-item class="q-pb-none">
      <q-item-section class="text-bold">
        Builder layouts
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :to="builderPath"
          icon="mdi-tools"
          size="sm"
          flat
          round
        >
          <q-tooltip>Open builder</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section class="col-auto">
        <q-btn
          :disable="layouts.length === 0"
          :color="editing ? 'primary' : ''"
          icon="mdi-sort"
          round
          flat
          size="sm"
          @click="editing = !editing"
        >
          <q-tooltip>
            Rearrange layouts
          </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <draggable
      v-model="layouts"
      :disabled="$dense || !editing"
      @start="dragging=true"
      @end="dragging=false"
    >
      <q-item
        v-for="layout in layouts"
        :key="layout.id"
        :to="editing ? undefined : `/brewery/${layout.id}`"
        :inset-level="0.2"
        :class="[
          'q-pb-sm',
          editing && 'bordered pointer',
        ]"
        style="min-height: 0px"
      >
        <q-item-section
          :class="['ellipsis', editing && 'text-italic']"
        >
          {{ layout.title }}
        </q-item-section>
      </q-item>
    </draggable>
  </div>
</template>

<style scoped>
.bordered {
  border: 1px solid whitesmoke;
  margin-top: 2px;
}
</style>
