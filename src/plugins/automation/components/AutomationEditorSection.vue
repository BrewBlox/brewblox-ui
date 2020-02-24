<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '../../../helpers/dialog';


@Component
export default class AutomationEditorSection extends Vue {

  @Prop({ type: Array, required: true })
  public readonly value!: HasId[];

  @Prop({ type: String, required: true })
  public readonly label!: string;

  get locals(): HasId[] {
    return this.value;
  }

  set locals(vals: HasId[]) {
    this.$emit('input', vals);
  }

  add(): void {
    this.$emit('new');
  }

  saveItem(item: any): void {
    this.$emit('update', item);
  }

  toggleEnabled(item: { enabled: boolean }): void {
    item.enabled = !item.enabled;
    this.saveItem(item);
  }

  enabledIcon(item: { enabled: boolean }): string {
    return item.enabled
      ? 'mdi-checkbox-marked-outline'
      : 'mdi-checkbox-blank-outline';
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
            {{ label }}
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
            :subtitle="item.impl ? item.impl.type : null"
            @title-click="$emit('title-click', item)"
          >
            <template #buttons>
              <q-btn
                v-if="item.enabled !== undefined"
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
                </template>
              </ActionMenu>
            </template>
          </Toolbar>
        </div>
        <div class="q-px-md q-pb-md">
          <slot name="item" :item="item" />
        </div>
      </div>

      <template #footer>
        <div>
          <slot name="footer" />
        </div>
      <!--  Todo: add creatable items -->
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
