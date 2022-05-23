<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { SequenceBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'SequenceWidget',
  setup() {
    const { context, inDialog } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<SequenceBlock>();

    const instructions = computed<string>({
      get: () => block.value.data.instructions.join('\n'),
      set: (s) => {
        block.value.data.instructions = s.split('\n');
        saveBlock();
      },
    });

    function editInstructions(): void {
      createDialog({
        component: 'TextAreaDialog',
        componentProps: {
          modelValue: instructions.value,
          title: 'Edit instructions',
        },
      }).onOk((s: string) => {
        block.value.data.instructions = s.split('\n');
        saveBlock();
      });
    }

    return {
      block,
      instructions,
      editInstructions,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <div>{{ block.data.status }}</div>
      <div>{{ block.data.error }}</div>
      <div>
        {{ block.data.activeInstruction + 1 }} /
        {{ block.data.instructions.length }}
      </div>
      <LabeledField
        v-model="instructions"
        title="Instructions"
        label="Instructions"
        autogrow
        @click="editInstructions"
      />
    </div>
  </Card>
</template>
