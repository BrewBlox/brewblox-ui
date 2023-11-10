<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { reactive, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { GraphAnnotation, GraphConfig, QueryParams } from '../types';

interface Props extends UseDialogProps {
  graphId: string;
  config: GraphConfig;
  sharedSources?: boolean;
  usePresets?: boolean;
  annotated?: boolean;
  saveAnnotations?: (a: GraphAnnotation[]) => unknown;
  saveParams?: (v: QueryParams) => unknown;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  sharedSources: false,
  usePresets: false,
  annotated: false,
  saveAnnotations: () => {},
  saveParams: () => {},
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();

const sourceRevision = ref<Date>(new Date());

// Dialog props are not reactive.
// We'll keep changes cached locally, and assume the parent applies them unchanged
const localConfig = reactive(cloneDeep(props.config));

function saveLocalParams(params: QueryParams): void {
  localConfig.params = params;
  sourceRevision.value = new Date();
  props.saveParams(params);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
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
        class="fit"
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
