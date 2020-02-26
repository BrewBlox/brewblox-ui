<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spaceCased } from '@/helpers/functional';

import { actionComponents } from '../actions';
import { conditionComponents } from '../conditions';
import { noteComponents } from '../notes';
import { AutomationItem } from '../types';
import AutomationItemUnknown from './AutomationItemUnknown.vue';

const allComponents = {
  ...actionComponents,
  ...conditionComponents,
  ...noteComponents,
};

@Component
export default class AutomationEditorSection extends Vue {

  @Prop({ type: Array, required: true })
  public readonly value!: AutomationItem[];

  @Prop({ type: String, required: true })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly label!: string;

  renderComponent(item: AutomationItem): VueConstructor {
    return allComponents[item.impl.type] ?? AutomationItemUnknown;
  }

  add(): void {
    this.$emit('new');
  }

  save(item: AutomationItem): void {
    this.$emit('update', item);
  }

  saveAll(items: AutomationItem[]): void {
    this.$emit('input', items);
  }

  get locals(): AutomationItem[] {
    return this.value;
  }

  set locals(items: AutomationItem[]) {
    this.saveAll(items);
  }

  toggleEnabled(item: AutomationItem): void {
    item.enabled = !item.enabled;
    this.save(item);
  }

  enabledIcon(item: AutomationItem): string {
    return item.enabled
      ? 'mdi-checkbox-marked-outline'
      : 'mdi-checkbox-blank-outline';
  }

  subtitle(item: AutomationItem): string {
    return spaceCased(item.impl.type);
  }

  startChangeTitle(item: AutomationItem): void {
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: `Change ${this.label} name`,
      message: `Choose a new name for '${item.title}'`,
      clearable: false,
      value: item.title,
    })
      .onOk(title => this.save({ ...item, title }));
  }

  removeItem(item: AutomationItem): void {
    this.saveAll(this.locals.filter(v => v.id !== item.id));
  }
}
</script>

<template>
  <q-scroll-area visible class="col">
    <draggable
      v-model="locals"
      class="column q-px-md q-pb-md q-gutter-y-md rounded-borders section-container"
    >
      <template #header>
        <div class="col-auto q-pl-sm">
          <div class="text-secondary" style="font-size: 170%">
            {{ title }}
          </div>
          <div class="darkish text-italic">
            <slot name="description" />
          </div>
        </div>
      </template>

      <div v-for="item in locals" :key="item.id" class="section-item rounded-borders depth-2">
        <div class="toolbar__Dashboard">
          <Toolbar
            :title="item.title"
            :subtitle="subtitle(item)"
            @title-click="startChangeTitle(item)"
          >
            <template #buttons>
              <q-btn
                dense
                flat
                round
                :icon="enabledIcon(item)"
                @click="toggleEnabled(item)"
              >
                <q-tooltip>
                  Toggle enabled
                </q-tooltip>
              </q-btn>
              <ActionMenu dense round>
                <template #actions>
                  <slot name="actions" :item="item" />
                  <ActionItem label="Rename" icon="edit" @click="startChangeTitle(item)" />
                  <ActionItem label="Remove" icon="delete" @click="removeItem(item)" />
                </template>
              </ActionMenu>
            </template>
          </Toolbar>
        </div>
        <div class="q-px-md q-pb-md">
          <component
            :is="renderComponent(item)"
            :style="{opacity: item.enabled ? 1 : 0.5}"
            :item="item"
            @update:item="save"
          />
        </div>
      </div>

      <template #footer>
        <div class="row justify-end q-pr-md">
          <q-btn fab-mini color="secondary" icon="add" @click="add">
            <q-tooltip>Add new {{ label }}</q-tooltip>
          </q-btn>
        </div>
      </template>
    </draggable>
  </q-scroll-area>
</template>

<style lang="sass" scoped>
.section-container
  > .section-item:nth-child(odd)
    border-left: 1px none rgba($grey-5, 0.8)
  > .section-item:nth-child(even)
    border-left: 1px none rgba($red-5, 0.8)
</style>
