<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { spaceCased } from '@/helpers/functional';

import { SQUARE_SIZE } from './getters';
import { asStatePart } from './helpers';
import { builderStore } from './store';
import { PersistentPart, StatePart } from './types';


@Component
export default class BuilderCatalog extends DialogBase {
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  partFilter: string | null = null;

  @Prop({ type: Object, default: () => ({}) })
  readonly partial!: Partial<PersistentPart>;

  get availableParts(): StatePart[] {
    const filter = (this.partFilter || '').toLowerCase();
    return builderStore.specIds
      .filter(type => `${type}|${spaceCased(type)}`.toLowerCase().match(filter))
      .map(type => ({
        type,
        id: uid(),
        x: -100,
        y: -100,
        rotate: 0,
        settings: {},
        flipped: false,
      }))
      .map(asStatePart);
  }

  partViewBox(part: StatePart): string {
    return part.size.map(v => v * SQUARE_SIZE).join(' ');
  }

  selectPart(part: StatePart): void {
    this.onDialogOk({ ...part, ...this.partial });
  }
}
</script>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <DialogToolbar>Part Catalog</DialogToolbar>

      <q-item dark class="q-mb-md">
        <q-item-section>
          <q-input v-model="partFilter" placeholder="Search Parts" clearable dark autofocus>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>

      <q-scroll-area style="min-height: 400px; height: 60vh;">
        <q-card-section>
          <div class="row">
            <q-item
              v-for="part in availableParts"
              :key="part.type"
              dark
              clickable
              class="col-6"
              @click="selectPart(part)"
            >
              <q-item-section side>
                <svg
                  :width="`${SQUARE_SIZE}px`"
                  :height="`${SQUARE_SIZE}px`"
                  :viewBox="`0 0 ${partViewBox(part)}`"
                >
                  <PartWrapper :part="part" />
                </svg>
              </q-item-section>
              <q-item-section>{{ spaceCased(part.type) }}</q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>
