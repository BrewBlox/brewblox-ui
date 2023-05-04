<script lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { nanoid } from 'nanoid';
import { computed, defineComponent, PropType, provide, ref } from 'vue';
import { PlaceholderKey } from '../symbols';
import { BuilderBlueprint, BuilderPart } from '../types';
import { coord2grid } from '../utils';

interface PartDisplay {
  part: BuilderPart;
  blueprint: BuilderBlueprint;
}

export default defineComponent({
  name: 'BuilderCatalogDialog',
  props: {
    ...useDialog.props,
    partial: {
      type: Object as PropType<Partial<BuilderPart>>,
      default: () => ({}),
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const builderStore = useBuilderStore();
    const { dense } = useGlobals.setup();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    // Rendered parts should display dummy values instead of errors
    provide(PlaceholderKey, true);

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
          part: {
            type: blueprint.type,
            id: nanoid(),
            x: 0,
            y: 0,
            width: blueprint.defaultSize.width,
            height: blueprint.defaultSize.height,
            rotate: 0,
            settings: {},
            flipped: false,
          },
        }));
    });

    function partViewBox(display: PartDisplay): string {
      const { width, height } = display.part;
      return `${coord2grid(width)} ${coord2grid(height)}`;
    }

    function selectPart(display: PartDisplay): void {
      onDialogOK({ ...display.part, ...props.partial });
    }

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: partFilter.value ?? undefined,
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
                    :width="50"
                    :height="50"
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
