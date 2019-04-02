<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    graph: {
      type: Boolean,
      default: false,
    },
  },
})
export default class BlockWidgetToolbar extends Vue {
  graphModalOpen: boolean = false;
}
</script>

<template>
  <WidgetToolbar :title="field.widgetTitle" :subtitle="field.displayName">
    <BlockGraph
      v-if="graphModalOpen"
      :value="graphModalOpen"
      :id="field.widgetId"
      :config="field.graphCfg"
      :change="v => field.graphCfg = v"
      @input="v => graphModalOpen = v"
    />

    <q-item-section side>
      <q-btn-dropdown flat split icon="settings" @click="field.openModal">
        <q-list dark bordered>
          <ActionItem
            v-if="graph"
            icon="mdi-chart-line"
            label="Show graph"
            @click="graphModalOpen = true"
          />
          <ActionItem icon="refresh" label="Refresh" @click="field.refreshBlock"/>
          <ActionItem
            v-if="field.$props.onCopy"
            icon="file_copy"
            label="Copy widget"
            @click="field.$props.onCopy(field.widgetId)"
          />
          <ActionItem
            v-if="field.$props.onMove"
            icon="exit_to_app"
            label="Move widget"
            @click="field.$props.onMove(field.widgetId)"
          />
          <ActionItem
            v-if="field.$props.onDelete"
            icon="delete"
            label="Delete widget"
            @click="field.$props.onDelete(field.widgetId)"
          />
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </WidgetToolbar>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
