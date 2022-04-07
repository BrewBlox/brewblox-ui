<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';

import { BuilderBlueprint, FlowPart, PersistentPart } from '../types';
import { asStatePart, coord2grid } from '../utils';

interface PartDisplay {
  part: FlowPart;
  blueprint: BuilderBlueprint;
}

function asFlowPart(part: PersistentPart): FlowPart {
  return { ...asStatePart(part), flows: {} };
}

export default defineComponent({
  name: 'BuilderCatalogDialog',
  props: {
    ...useDialog.props,
    partial: {
      type: Object as PropType<Partial<PersistentPart>>,
      default: () => ({}),
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const builderStore = useBuilderStore();
    const { dense } = useGlobals.setup();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const partFilter = ref<string | null>(null);

    const available = computed<PartDisplay[]>(() => {
      const filter = new RegExp(partFilter.value || '', 'i');
      return builderStore.blueprints
        .filter((blueprint) =>
          `${blueprint.type}|${blueprint.title}`.match(filter),
        )
        .sort(makeObjectSorter('title'))
        .map((blueprint) => ({
          blueprint,
          part: asFlowPart({
            type: blueprint.type,
            id: nanoid(),
            x: 0,
            y: 0,
            rotate: 0,
            settings: {},
            flipped: false,
          }),
        }));
    });

    function partViewBox(display: PartDisplay): string {
      return display.part.size.map(coord2grid).join(' ');
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
      }).onOk((v: string) => (partFilter.value = v));
    }

    return {
      coord2grid,
      dense,
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
    :maximized="dense"
    v-bind="dialogProps"
    transition-hide="fade"
    @hide="onDialogHide"
  >
    <Card no-scroll>
      <template #toolbar>
        <Toolbar title="Part Catalog" />
      </template>

      <div class="fit column q-pb-md">
        <q-item class="q-mb-md">
          <q-item-section>
            <q-input
              v-model="partFilter"
              placeholder="Search Parts"
              clearable
              autofocus
            >
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
                :key="v.blueprint.type"
                clickable
                class="col-6"
                @click="selectPart(v)"
              >
                <q-item-section side>
                  <svg
                    :width="`${coord2grid(1)}px`"
                    :height="`${coord2grid(1)}px`"
                    :viewBox="`0 0 ${partViewBox(v)}`"
                  >
                    <PartWrapper :part="v.part" />
                  </svg>
                </q-item-section>
                <q-item-section>{{ v.blueprint.title }}</q-item-section>
              </q-item>
            </div>
          </q-card-section>
        </q-scroll-area>
      </div>
    </Card>
  </q-dialog>
</template>
