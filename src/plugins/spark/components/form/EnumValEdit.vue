<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class EnumValEdit extends ValEditBase {

  @Prop({ type: Number, default: 1 })
  readonly timeScale!: number;

  @Prop({ type: Array, required: true })
  public readonly options!: SelectOption[];

  @Prop({ type: Object, default: () => ({}) })
  public readonly selectProps!: any;

}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-select
      v-model="field"
      :options="options"
      :dense="dense"
      label="Value"
      v-bind="selectProps"
      class="col-grow"
      item-aligned
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ value }}
  </div>
</template>
