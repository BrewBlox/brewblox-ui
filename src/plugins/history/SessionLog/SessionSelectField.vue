<script lang="ts">
import escapeRegExp from 'lodash/escapeRegExp';
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';

import { LoggedSession } from '../types';

interface SessionOpt extends SelectOption {
  session: LoggedSession;
}


@Component
export default class SessionSelectField extends FieldBase {
  filteredOpts: SessionOpt[] = [];

  @Prop({ type: Object, default: null })
  public readonly value!: LoggedSession | null;

  @Prop({ type: Array, required: true })
  public readonly sessions!: LoggedSession[];

  created(): void {
    this.filteredOpts = this.sessionOpts;
  }

  get selected(): SessionOpt | null {
    return this.value === null
      ? null
      : this.asOpt(this.value);
  }

  set selected(opt: SessionOpt | null) {
    this.$emit('input', opt?.session ?? null);
  }

  asOpt(session: LoggedSession): SessionOpt {
    return {
      session,
      label: `${session.title} (${new Date(session.date).toLocaleDateString()})`,
      value: session.id,
    };
  }

  get sessionOpts(): SessionOpt[] {
    return this.sessions.map(this.asOpt);
  }

  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filteredOpts = this.sessionOpts);
      return;
    }

    update(() => {
      const needle = escapeRegExp(val.toLowerCase());
      this.filteredOpts = this.sessionOpts
        .filter(opt => opt.label.toLowerCase().match(needle)
          || opt.session.tags?.some(t => t.toLowerCase().match(needle)));
    });
  }
}
</script>

<template>
  <q-select
    v-model="selected"
    :options="filteredOpts"
    :label="label"
    autofocus
    clearable
    item-aligned
    use-input
    fill-input
    hide-selected
    placeholder="Search by name or tag"
    @filter="filterFn"
    @keyup.enter.exact.stop
  >
    <template #option="{opt, selected, toggleOption}">
      <q-item :active="selected" clickable @click="toggleOption(opt)">
        <q-item-section style="max-width: 300px">
          {{ opt.label }}
          <q-item-label v-if="opt.session.tags && opt.session.tags.length > 0" caption>
            <div class="row wrap q-gutter-xs">
              <q-badge
                v-for="tag in opt.session.tags"
                :key="`tag-${opt.value}-${tag}`"
                color="blue-grey-8"
              >
                <small>{{ tag }}</small>
              </q-badge>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
