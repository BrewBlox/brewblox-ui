<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class AutomationSectionEditor extends Vue {

  @Prop({ type: Array, required: true })
  public readonly value!: { id: string }[];

  @Prop({ type: String, required: true })
  public readonly label!: string;

  get locals(): { id: string }[] {
    return this.value;
  }

  set locals(vals: { id: string }[]) {
    this.$emit('input', vals);
  }

  add(): void {
    this.$emit('new');
  }
}
</script>

<template>
  <q-card-section class="q-px-sm full-height">
    <q-item dark class="q-pt-none">
      <q-item-section class="text-info text-center">
        <big>{{ label }}</big>
      </q-item-section>
      <q-btn icon="add" flat style="position: absolute; right: 0" @click="add">
        <q-tooltip>New</q-tooltip>
      </q-btn>
    </q-item>
    <q-separator dark class="q-mb-md" />
    <q-list dark>
      <draggable v-model="locals" class="section-container">
        <div v-for="item in locals" :key="item.id" class="row q-mb-md">
          <div class="col-auto column">
            <q-btn flat icon="mdi-dots-vertical">
              <q-menu>
                <q-list dark bordered>
                  <slot name="actions" :item="item" />
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <slot name="item" :item="item" />
        </div>
      </draggable>
    </q-list>
  </q-card-section>
</template>

<style scoped>
.section-container > div:nth-child(odd) {
  border-left: 2px solid dodgerblue;
}
.section-container > div:nth-child(even) {
  border-left: 2px solid red;
}
</style>
