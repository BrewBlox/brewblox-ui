<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';
import ProfileSnippetDialog from './ProfileSnippetDialog.vue';

export default defineComponent({
  name: 'ProfilePresetAction',
  props: {
    icon: {
      type: String,
      default: 'mdi-file',
    },
    label: {
      type: String,
      default: 'Load/Save profile',
    },
  },
  setup() {
    const { block } = useBlockWidget.setup<SetpointProfileBlock>();

    async function showDialog(): Promise<void> {
      createDialog({
        component: ProfileSnippetDialog,
        componentProps: {
          block: block.value,
          title: 'Load/Save Profile',
        },
      });
    }

    return {
      showDialog,
    };
  },
});
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="showDialog"
  />
</template>
