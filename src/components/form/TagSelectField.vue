<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '../FieldBase';


@Component
export default class TagSelectField extends FieldBase {
  suggestions: string[] = [];

  @Prop({ type: Array, required: true })
  public readonly value!: string[];

  @Prop({ type: Array, default: () => [] })
  public readonly existing!: string[];

  get tags(): string[] {
    return this.value;
  }

  save(tags: string[]): void {
    this.$emit('input', tags);
  }


  onInput(val, update): void {
    if (val === '') {
      update(() => this.suggestions = []);
      return;
    }
    update(() => {
      const needle = val.toLowerCase();
      this.suggestions = this.existing
        .filter(t => !this.tags.includes(t))
        .filter(t => t.toLowerCase().match(needle))
        .slice(0, 5);
    });
  }
}
</script>

<template>
  <div>
    <q-select
      :value="tags"
      multiple
      use-chips
      stack-label
      label="Tags"
      item-aligned
      use-input
      hide-dropdown-icon
      new-value-mode="add-unique"
      @input="save"
      @filter="onInput"
      @keyup.native.stop.tab="pickSuggestion"
    >
      <template #selected-item="scope">
        <q-chip
          removable
          dense
          :tabindex="scope.tabindex"
          color="blue-grey-8"
          class="q-ma-xs"
          @remove="scope.removeAtIndex(scope.index)"
        >
          {{ scope.opt }}
        </q-chip>
      </template>
      <template v-if="!!$scopedSlots.append" #append>
        <slot name="append" />
      </template>
      <template v-if="!!$scopedSlots.after" #after>
        <slot name="after" />
      </template>
    </q-select>
    <LabeledField v-if="suggestions.length > 0" label="Add existing tag" item-aligned>
      <div class="row wrap q-gutter-xs">
        <q-chip
          v-for="tag in suggestions"
          :key="`suggestion-${tag}`"
          class="hoverable"
          color="blue-grey-8"
          @click.native="save([...tags, tag])"
        >
          {{ tag }}
        </q-chip>
      </div>
    </LabeledField>
  </div>
</template>
