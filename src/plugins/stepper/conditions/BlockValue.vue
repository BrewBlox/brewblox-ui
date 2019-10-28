<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

import { StepCondition } from '../types';

interface BlockValueOpts {
  block: string;
  service: string;
  type: string;
  key: string;
  operator: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';
  value: any;
}

interface BlockValueCondition extends StepCondition {
  opts: BlockValueOpts;
}

@Component
export default class BlockValue extends Vue {
  @Prop({ type: Object, required: true })
  public readonly condition!: BlockValueCondition;

  saveCondition(condition: BlockValueCondition = this.condition): void {
    this.$emit('update:condition', condition);
  }

  get opts(): BlockValueOpts {
    return this.condition.opts;
  }

  get spec(): BlockSpec {
    return sparkStore.specs[this.opts.type];
  }

  get link(): Link {
    return new Link(this.opts.block, this.opts.type);
  }

  set link(val: Link) {
    if (val.id !== null) {
      this.opts.block = val.id;
      this.saveCondition();
    }
  }

  get displayName(): string {
    return featureStore.displayName(this.opts.type);
  }
}
</script>

<template>
  <q-list dark dense>
    <q-item dark>
      <q-item-section>
        <LinkField
          v-model="link"
          :service-id="opts.service"
          :clearable="false"
          tag="big"
        />
      </q-item-section>
      <q-space />
      <q-item-section side class="text-h6 text-italic">
        {{ displayName }}
      </q-item-section>
    </q-item>
  </q-list>
</template>
