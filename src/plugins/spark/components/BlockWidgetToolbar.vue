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
          <q-item v-close-popup v-if="graph" dark clickable @click="graphModalOpen = true">
            <q-item-section avatar>
              <q-icon name="mdi-chart-line"/>
            </q-item-section>
            <q-item-section>Show graph</q-item-section>
          </q-item>
          <q-item v-close-popup dark clickable @click="field.refreshBlock">
            <q-item-section avatar>
              <q-icon name="refresh"/>
            </q-item-section>
            <q-item-section>Refresh</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            v-if="field.$props.onCopy"
            dark
            clickable
            @click="field.$props.onCopy(field.widgetId)"
          >
            <q-item-section avatar>
              <q-icon name="file_copy"/>
            </q-item-section>
            <q-item-section>Copy widget</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            v-if="field.$props.onMove"
            dark
            clickable
            @click="field.$props.onMove(field.widgetId)"
          >
            <q-item-section avatar>
              <q-icon name="exit_to_app"/>
            </q-item-section>
            <q-item-section>Move widget</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            v-if="field.$props.onDelete"
            dark
            clickable
            @click="field.$props.onDelete(field.widgetId)"
          >
            <q-item-section avatar>
              <q-icon name="delete"/>
            </q-item-section>
            <q-item-section>Delete widget</q-item-section>
          </q-item>
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
