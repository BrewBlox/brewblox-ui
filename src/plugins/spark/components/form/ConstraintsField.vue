<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { constraintLabels } from '@/plugins/spark/helpers';
import { ConstraintsObj } from '@/plugins/spark/types';


@Component
export default class ConstraintsField extends FieldBase {

  @Prop({ type: String, default: 'Edit constraints' })
  public readonly title!: string;

  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  @Prop({ type: String, required: true, validator: v => ['analog', 'digital'].includes(v) })
  public readonly type!: string;

  @Emit('input')
  public change(v: ConstraintsObj): ConstraintsObj {
    return v;
  }

  get numConstraints(): number {
    return this.value.constraints.length;
  }

  get limiters(): string[] {
    const names: string[] = [];
    for (const constraint of this.value.constraints) {
      if (constraint.limiting) {
        names.push(Object.keys(constraint).find(k => k !== 'limiting') || 'Unknown');
      }
    }
    return names.map(k => constraintLabels.get(k) || k);
  }

  openDialog(): void {
    createDialog({
      component: 'ConstraintsDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      value: this.value,
      serviceId: this.serviceId,
      type: this.type,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <q-list dark>
    <q-item dark clickable style="padding: 5px 0; min-height: 0" @click="openDialog">
      <q-tooltip>Edit constraints</q-tooltip>
      <q-item-section class="col-auto darkish">
        <small v-if="limiters.length">
          Limited by:
          <i>{{ limiters.join(', ') }}</i>
        </small>
        <small v-else-if="numConstraints > 0">{{ numConstraints }} constraint(s), not limited</small>
        <small v-else>No constraints configured</small>
      </q-item-section>
      <q-space />
      <q-item-section side>
        <q-icon name="edit" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
