<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { objectStringSorter } from '@/utils/functional';

import { builderStore } from './store';
import { FlowPart, PartSpec, PersistentPart } from './types';
import { asStatePart, squares } from './utils';

interface PartDisplay {
  part: FlowPart;
  spec: PartSpec;
}

function asFlowPart(part: PersistentPart): FlowPart {
  return { ...asStatePart(part), flows: {} };
}

export default defineComponent({
  name: 'BuilderCatalog',
  props: {
    ...useDialog.props,
    partial: {
      type: Object as PropType<Partial<PersistentPart>>,
      default: () => ({}),
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const partFilter = ref<string | null>(null);

    const available = computed<PartDisplay[]>(
      () => {
        const filter = new RegExp(partFilter.value || '', 'i');
        return builderStore.specs
          .filter(spec => `${spec.id}|${spec.title}`.match(filter))
          .sort(objectStringSorter('title'))
          .map(spec => ({
            spec,
            part: asFlowPart({
              type: spec.id,
              id: nanoid(),
              x: 0,
              y: 0,
              rotate: 0,
              settings: {},
              flipped: false,
            }),
          }));
      },
    );

    function partViewBox(display: PartDisplay): string {
      return display.part.size.map(squares).join(' ');
    }

    function selectPart(display: PartDisplay): void {
      onDialogOK({ ...display.part, ...props.partial });
    }

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: partFilter.value,
        },
      })
        .onOk((v: string) => partFilter.value = v);
    }

    return {
      squares,
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      partFilter,
      available,
      partViewBox,
      selectPart,
      showSearchKeyboard,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <CardWrapper no-scroll>
      <template #toolbar>
        <DialogToolbar title="Part Catalog" />
      </template>

      <div class="fit column q-pb-md">
        <q-item class="q-mb-md">
          <q-item-section>
            <q-input v-model="partFilter" placeholder="Search Parts" clearable autofocus>
              <template #append>
                <KeyboardButton @click="showSearchKeyboard" />
                <q-icon name="search" />
              </template>
            </q-input>
          </q-item-section>
        </q-item>

        <q-scroll-area class="col">
          <q-card-section>
            <div class="row">
              <q-item
                v-for="v in available"
                :key="v.spec.id"
                clickable
                class="col-6"
                @click="selectPart(v)"
              >
                <q-item-section side>
                  <svg
                    :width="`${squares(1)}px`"
                    :height="`${squares(1)}px`"
                    :viewBox="`0 0 ${partViewBox(v)}`"
                  >
                    <PartWrapper :part="v.part" />
                  </svg>
                </q-item-section>
                <q-item-section>{{ v.spec.title }}</q-item-section>
              </q-item>
            </div>
          </q-card-section>
        </q-scroll-area>
      </div>
    </CardWrapper>
  </q-dialog>
</template>
