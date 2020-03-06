<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spaceCased } from '@/helpers/functional';

import { allSpecs } from '../impl/specs';
import { AutomationItem } from '../types';
import AutomationItemUnknown from './AutomationItemUnknown.vue';


@Component
export default class AutomationItems extends Vue {

  @Prop({ type: Array, required: true })
  public readonly value!: AutomationItem[];

  @Prop({ type: String, required: true })
  public readonly label!: string;

  renderComponent(item: AutomationItem): VueConstructor {
    return allSpecs[item.impl.type]?.component ?? AutomationItemUnknown;
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

  subtitle(item: AutomationItem): string {
    return allSpecs[item.impl.type]?.title ?? 'Unknown';
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
  <div class="q-px-md q-pb-md">
    <slot name="header" />
    <draggable
      v-model="locals"
      class="column q-gutter-y-md q-my-none"
    >
      <div
        v-for="item in locals"
        :key="item.id"
        class="rounded-borders depth-2"
        :style="{opacity: item.enabled ? 1 : 0.3}"
      >
        <div class="toolbar__Dashboard">
          <Toolbar
            :title="item.title"
            :subtitle="subtitle(item)"
            @title-click="startChangeTitle(item)"
          >
            <template #buttons>
              <EnabledButton
                dense
                round
                :value="item.enabled"
                @input="v => {item.enabled = v; save(item);}"
              />
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
            :item="item"
            @update:item="save"
          />
        </div>
      </div>
    </draggable>
  </div>
</template>
