<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { clamp, filterById } from '@/helpers/functional';

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

  move(item: AutomationItem, offset: number): void {
    const idx = this.locals.findIndex(v => v.id === item.id);
    const newIdx = clamp(idx + offset, 0, this.locals.length - 1);
    if (idx !== -1 && idx !== newIdx) {
      const updated = [...this.locals];
      updated.splice(idx, 1);
      updated.splice(newIdx, 0, item);
      this.locals = updated;
    }
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
    this.locals = filterById(this.locals, item);
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
      <div v-if="locals.length === 0" class="q-px-sm darkish text-italic">
        <slot name="empty" />
      </div>
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
                  <ActionItem label="Move up" icon="mdi-chevron-up" @click="move(item, -1)" />
                  <ActionItem label="Move down" icon="mdi-chevron-down" @click="move(item, 1)" />
                  <ActionItem :label="`Rename ${label}`" icon="edit" @click="startChangeTitle(item)" />
                  <ActionItem :label="`Remove ${label}`" icon="delete" @click="removeItem(item)" />
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
    <div class="row justify-end q-pt-md q-pr-sm">
      <q-btn
        :label="`New ${label}`"
        flat
        dense
        color="secondary"
        icon="add"
        @click="add"
      />
    </div>
  </div>
</template>
