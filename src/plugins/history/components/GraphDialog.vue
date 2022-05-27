<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';

import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/objects';

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
    usePresets: {
      type: Boolean,
      default: false,
    },
    annotated: {
      type: Boolean,
      default: false,
    },
    saveAnnotations: {
      type: Function as PropType<(a: GraphAnnotation[]) => unknown>,
      default: () => {},
    },
    saveParams: {
      type: Function as PropType<(v: QueryParams) => unknown>,
      default: () => {},
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide } = useDialog.setup();

    const sourceRevision = ref<Date>(new Date());

    // Dialog props are not reactive.
    // We'll keep changes cached locally, and assume the parent applies them unchanged
    const localConfig = reactive(deepCopy(props.config));

    function saveLocalParams(params: QueryParams): void {
      localConfig.params = params;
      sourceRevision.value = new Date();
      props.saveParams(params);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      sourceRevision,
      localConfig,
      saveLocalParams,
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
        :config="localConfig"
        v-bind="{
          graphId,
          sharedSources,
          usePresets,
          annotated,
          sourceRevision,
        }"
        maximized
        @annotations="saveAnnotations"
        @params="saveLocalParams"
      >
        <template #controls>
          <DialogCloseButton stretch />
        </template>
      </HistoryGraph>
    </q-card>
  </q-dialog>
</template>
