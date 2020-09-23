<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { deserialize } from '@/plugins/spark/parse-object';

import QuickActionsBasic from './QuickActionsBasic.vue';
import QuickActionsFull from './QuickActionsFull.vue';
import { ChangeAction, QuickActionsConfig } from './types';

@Component({
  components: {
    Basic: QuickActionsBasic,
    Full: QuickActionsFull,
  },
})
export default class QuickActionsWidget extends WidgetBase<QuickActionsConfig> {
  @Prop({ type: String, required: false })
  public readonly activeId!: string;

  get actions(): ChangeAction[] {
    return deserialize(this.config.actions ?? this.config.steps);
  }

  saveActions(actions: ChangeAction[] = this.actions): void {
    this.config.actions = actions;
    this.config.steps = undefined;
    this.saveConfig();
  }

  created(): void {
    let dirty = false;
    // Change IDs were added after initial release
    this.actions.forEach(action =>
      action.changes
        .filter(change => change.id === undefined)
        .forEach(change => {
          change.id = uid();
          dirty = true;
        }));
    // Service IDs became a key of individual changes
    this.actions.forEach(action =>
      action.changes
        .filter(change => change.serviceId === undefined)
        .forEach(change => {
          change.serviceId = this.config.serviceId!;
          dirty = true;
        }));
    // Config field was renamed to 'actions'
    dirty = dirty || !!this.config.steps;
    // Save if dirty
    if (dirty) {
      this.config.serviceIdMigrated = true;
      this.config.changeIdMigrated = true;
      this.saveActions();
    }
  }

  addAction(): void {
    createDialog({
      title: 'Add an action',
      message: 'Actions let you immediately set multiple block fields to predetermined values.',
      cancel: true,
      prompt: {
        model: 'New action',
        type: 'text',
      },
    })
      .onOk(name => {
        this.actions.push({ name, id: uid(), changes: [] });
        this.saveActions();
      });
  }
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #menus>
          <WidgetActions :crud="crud">
            <ExportAction :crud="crud" />
          </WidgetActions>
        </template>
      </component>
    </template>
    <component :is="mode" :crud="crud" :active-id="activeId">
      <template v-if="actions.length === 0" #warnings>
        <div class="text-italic text-h6 q-pa-md darkened text-center">
          Create an action to get started.
        </div>
      </template>
      <template #below>
        <q-btn
          flat
          dense
          color="secondary"
          icon="add"
          label="New action"
          class="self-end"
          @click="addAction"
        />
      </template>
    </component>
  </CardWrapper>
</template>
