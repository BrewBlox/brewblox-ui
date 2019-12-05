<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { historyStore } from '../store';
import { LoggedSession } from '../types';


interface SessionOpt extends SelectOption {
  session: LoggedSession;
}

@Component
export default class SessionLoadDialog extends DialogBase {
  selected: string | null = null;
  filteredOpts: SessionOpt[] = [];

  @Prop({ type: String })
  public readonly initialValue!: string | null;

  get sessions(): LoggedSession[] {
    return historyStore.sessionValues;
  }

  get sessionOpts(): SessionOpt[] {
    return this.sessions.map(session => ({
      session,
      label: `${session.title} (${new Date(session.date).toLocaleDateString()})`,
      value: session.id,
    }));
  }


  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filteredOpts = this.sessionOpts);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filteredOpts = this.sessionOpts
        .filter(opt => opt.label.toLowerCase().match(needle)
          || opt.session.tags?.some(t => t.toLowerCase().match(needle)));
    });
  }

  created(): void {
    this.filteredOpts = this.sessionOpts;
    //this.selected = this.initialValue;
  }

  save(): void {
    this.onDialogOk(this.selected);
  }
}
</script>


<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-model="selected"
        :options="filteredOpts"
        label="Select session"
        autofocus
        clearable
        emit-value
        map-options
        item-aligned
        use-input
        hint="Type to search by name or tag"
        @filter="filterFn"
      >
        <template #option="{opt, selected}">
          <q-item :active="selected" clickable>
            <q-item-section style="max-width: 300px">
              {{ opt.label }}
              <q-item-label v-if="opt.session.tags && opt.session.tags.length > 0" caption>
                <div class="row wrap q-gutter-xs">
                  <q-badge
                    v-for="tag in opt.session.tags"
                    :key="`tag-${opt.value}-${tag}`"
                    dense
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

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
