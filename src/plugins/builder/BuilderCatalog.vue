<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { objectStringSorter } from '@/helpers/functional';

import { SQUARE_SIZE } from './getters';
import { asStatePart } from './helpers';
import { builderStore } from './store';
import { PartSpec, PersistentPart, StatePart } from './types';

interface PartDisplay {
  part: StatePart;
  spec: PartSpec;
}


@Component
export default class BuilderCatalog extends DialogBase {
  SQUARE_SIZE: number = SQUARE_SIZE;

  partFilter: string | null = null;

  @Prop({ type: Object, default: () => ({}) })
  readonly partial!: Partial<PersistentPart>;

  get available(): PartDisplay[] {
    const filter = (this.partFilter || '').toLowerCase();
    return builderStore.specValues
      .filter(spec => `${spec.id}|${spec.title}`.toLowerCase().match(filter))
      .sort(objectStringSorter('title'))
      .map(spec => ({
        spec,
        part: asStatePart({
          type: spec.id,
          id: uid(),
          x: 0,
          y: 0,
          rotate: 0,
          settings: {},
          flipped: false,
        }),
      }));
  }

  partViewBox(display: PartDisplay): string {
    return display.part.size.map(v => v * SQUARE_SIZE).join(' ');
  }

  selectPart(display: PartDisplay): void {
    this.onDialogOk({ ...display.part, ...this.partial });
  }
}
</script>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar>Part Catalog</DialogToolbar>
      </template>

      <div class="fit column q-pb-md">
        <q-item class="q-mb-md">
          <q-item-section>
            <q-input v-model="partFilter" placeholder="Search Parts" clearable autofocus>
              <template #append>
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
                    :width="`${SQUARE_SIZE}px`"
                    :height="`${SQUARE_SIZE}px`"
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
