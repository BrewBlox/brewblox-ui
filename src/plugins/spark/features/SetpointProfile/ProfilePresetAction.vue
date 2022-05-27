<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { SetpointProfileBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';

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
