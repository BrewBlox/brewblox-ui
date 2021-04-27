<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useDialog } from '@/composables';

import { GraphAnnotation, GraphConfig, QueryParams } from '../types';

export default defineComponent({
  name: 'GraphDialog',
  props: {
    ...useDialog.props,
    graphId: {
      type: String,
      required: true,
    },
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
    sharedSources: {
      type: Boolean,
      default: false,
    },
    saveAnnotations: {
      type: Function as PropType<(a: GraphAnnotation[]) => unknown>,
      default: null,
    },
    saveParams: {
      type: Function as PropType<(v: QueryParams) => unknown>,
      default: null,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup() {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
    } = useDialog.setup();

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    transition-show="fade"
    maximized
    @hide="onDialogHide"
  >
    <q-card>
      <HistoryGraph
        v-bind="{graphId, config, sharedSources}"
        :use-presets="!!saveParams"
        :annotated="!!saveAnnotations"
        maximized
        @annotations="saveAnnotations"
        @params="saveParams"
      >
        <template #controls>
          <DialogCloseButton stretch />
        </template>
      </HistoryGraph>
    </q-card>
  </q-dialog>
</template>
