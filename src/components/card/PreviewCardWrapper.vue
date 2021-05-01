<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PreviewCardWrapper',
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
    <CardWrapper
      class="col-5"
      v-bind="$attrs"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <slot />
      <template #actions>
        <slot name="actions" />
      </template>
    </CardWrapper>
    <q-btn
      dense
      :class="['col-auto toggle-tab self-center',{collapsed}]"
      :label="collapsed ? expandLabel : collapseLabel"
      @click="collapsed = !collapsed"
    />
    <div v-if="!collapsed" class="col-5 bg-dark">
      <div class="preview-pane fit">
        <slot name="pane" />
      </div>
    </div>
  </div>
  <CardWrapper
    v-else
    v-bind="$attrs"
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <slot />
    <template #actions>
      <slot name="actions" />
    </template>
  </CardWrapper>
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
