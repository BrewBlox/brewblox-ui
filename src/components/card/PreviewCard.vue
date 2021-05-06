<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PreviewCard',
  props: {
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
  },
  setup(props) {
    const collapsed = ref(!props.showInitial);

    return {
      collapsed,
    };
  },
});
</script>

<template>
  <div
    v-if="enabled && $q.screen.gt.md"
    class="row no-wrap justify-center combined-wrapper"
  >
    <!-- Normal Card -->
    <Card
      class="col-5"
      v-bind="$attrs"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <slot />
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </Card>
    <!-- Pane toggle button -->
    <q-btn
      dense
      :class="['col-auto toggle-tab self-center',{collapsed}]"
      :label="collapsed ? expandLabel : collapseLabel"
      @click="collapsed = !collapsed"
    />
    <!-- The preview pane -->
    <div v-if="!collapsed" class="col-5 bg-dark">
      <div class="preview-pane fit">
        <slot name="preview" />
      </div>
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
    <template v-if="$slots.actions" #actions>
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
  box-shadow: none

.toggle-tab
  background-color: $dialog-toolbar-color
  padding: 30px 2px
  border-radius: 5px 0 0 5px
  margin-left: 5px

.toggle-tab.collapsed
  border-radius: 0 5px 5px 0
  margin-left: 0

.preview-pane
  border-radius: 4px
  border: 1px solid $blue-grey-9
</style>
