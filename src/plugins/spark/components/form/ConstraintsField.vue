<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { analogConstraintLabels, digitalConstraintLabels } from '@/plugins/spark/getters';
import { AnalogConstraint, DigitalConstraint } from '@/plugins/spark/types';

const constraintLabels = {
  ...digitalConstraintLabels,
  ...analogConstraintLabels,
};

interface AnyConstraintsObj {
  constraints: (AnalogConstraint | DigitalConstraint)[];
}

@Component
export default class ConstraintsField extends FieldBase {

  @Prop({ type: String, default: 'Edit constraints' })
  public readonly title!: string;

  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: AnyConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  @Prop({ type: String, required: true, validator: v => ['analog', 'digital'].includes(v) })
  public readonly type!: 'analog' | 'digital';

  @Emit('input')
  public change(v: AnyConstraintsObj): AnyConstraintsObj {
    return v;
  }

  get numConstraints(): number {
    return this.value.constraints.length;
  }

  get limiters(): string[] {
    if (this.type === 'analog') {
      return (this.value.constraints as AnalogConstraint[])
        .filter(c => c.limiting)
        .map(c => Object.keys(c).find(k => k !== 'limiting') ?? 'Unknown')
        .map(k => constraintLabels[k] ?? k);
    }
    else {
      return (this.value.constraints as DigitalConstraint[])
        .filter(c => c.remaining.value)
        .map(c => {
          const key = Object.keys(c).find(k => k !== 'remaining') ?? 'Unknown';
          const label = constraintLabels[key] ?? key;
          return `${label} (${c.remaining})`;
        });
    }
  }

  get textColor(): string {
    if (this.limiters.length > 0) { return 'text-pink-4'; }
    if (this.numConstraints > 0) { return 'text-indigo-4'; }
    return 'darkish';
  }

  openDialog(): void {
    createDialog({
      component: 'ConstraintsDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.value,
      serviceId: this.serviceId,
      type: this.type,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <q-list class="clickable">
    <div :class="['q-pa-sm q-gutter-x-sm row', textColor]" @click="openDialog">
      <q-icon name="mdi-border-outside" class="col-auto" size="sm" />
      <div class="col-auto">
        <small v-if="limiters.length">
          Limited by:
          <i>{{ limiters.join(', ') }}</i>
        </small>
        <small v-else-if="numConstraints > 0">
          {{ numConstraints }} constraint(s), not limited</small>
        <small v-else>
          No constraints configured</small>
      </div>
    </div>
  </q-list>
</template>
