<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';

import { SQUARE_SIZE } from './getters';
import { parts } from './register';
import specs from './specs';
import { PersistentPart, StatePart } from './types';


@Component
export default class BuilderCatalog extends Vue {
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  @Prop({ type: Object, default: () => ({}) })
  readonly partial!: Partial<PersistentPart>;

  get availableParts(): StatePart[] {
    return parts
      .map(type => ({
        type,
        id: uid(),
        x: -100,
        y: -100,
        rotate: 0,
        settings: {},
        flipped: false,
        state: {},
      }));
  }

  partViewBox(part: PersistentPart): string {
    return specs[part.type].size(part).map(v => v * SQUARE_SIZE).join(' ');
  }

  selectPart(part: PersistentPart) {
    this.$emit('create', { ...part, ...this.partial });
    this.$nextTick(() => this.$emit('close'));
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <DialogToolbar>Part Catalog</DialogToolbar>

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
</template>
