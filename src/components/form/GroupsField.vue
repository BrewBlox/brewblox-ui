<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

@Component
export default class GroupsField extends FieldBase {

  @Prop({ type: Array, required: true })
  public readonly value!: string[];

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get groupNames(): string[] {
    return sparkStore.groupNames(this.serviceId);
  }

  get displayValue(): string {
    const actual = this.value
      .map(groupIdx => this.groupNames[groupIdx])
      .filter(name => name !== undefined)
      .join(', ');
    return actual || '<Click to set>';
  }

  @Emit('input')
  public change(v: string[]): string[] {
    return v;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      title: this.title,
      message: this.message,
      cancel: true,
      options: {
        type: 'checkbox',
        model: [...this.value],
        items: this.groupNames.map((p, idx) => ({ label: p, value: idx })),
      },
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <q-field
    :label="label"
    :class="[{pointer: !readonly}, $attrs.class]"
    stack-label
    v-bind="$attrs"
    @click.native="openDialog"
  >
    <template #control>
      <component :is="tag" class="q-mt-sm">
        <slot name="value">
          {{ displayValue }}
        </slot>
      </component>
    </template>
  </q-field>
</template>
