<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  enabled: {
    type: Boolean,
    default: false,
  },
  showInitial: {
    type: Boolean,
    default: false,
  },
  expandLabel: {
    type: String,
    default: 'Show',
  },
  collapseLabel: {
    type: String,
    default: 'Hide',
  },
  toggleIcon: {
    type: String,
    default: 'mdi-chart-line',
  },
});

const collapsed = ref(!props.showInitial);
</script>

<template>
  <div
    v-if="enabled && $q.screen.gt.md"
    class="row no-wrap justify-center combined-wrapper"
  >
    <!-- Normal Card -->
    <Card
      class="col-auto"
      v-bind="$attrs"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <slot />
      <template
        v-if="$slots.actions"
        #actions
      >
        <slot name="actions" />
      </template>
    </Card>
    <!-- Pane toggle button -->
    <q-btn
      dense
      stack
      :icon="toggleIcon"
      :class="['col-auto toggle-tab self-center', { collapsed }]"
      :label="collapsed ? expandLabel : collapseLabel"
      @click="collapsed = !collapsed"
    />
    <!-- The preview pane -->
    <div
      v-if="!collapsed"
      class="col-5 bg-dark preview-pane column"
    >
      <slot name="preview" />
    </div>
  </div>
  <!--
  Preview pane is not available.
  Fall back to acting like a normal Card.
  -->
  <Card
    v-else
    v-bind="$attrs"
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <slot />
    <template
      v-if="$slots.actions"
      #actions
    >
      <slot name="actions" />
    </template>
  </Card>
</template>

<style lang="sass" scoped>
.combined-wrapper
  height: 800px
  max-height: 90vh
  width: 90vw
  min-width: 90vw

.toggle-tab
  background-color: $dialog-toolbar-color
  padding: 30px 5px
  border-radius: 5px 0 0 5px
  margin-left: 5px

.toggle-tab.collapsed
  border-radius: 0 5px 5px 0
  margin-left: 0

.preview-pane
  border-radius: 4px
  border: 1px solid $blue-grey-9
  box-sizing: content-box
  position: relative
</style>
