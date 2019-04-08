<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { uid } from 'quasar';
import { SQUARE_SIZE } from './getters';
import { parts } from './register';
import settings from './settings';
import { PersistentPart } from './state';
import { spaceCased } from '@/helpers/functional';


@Component({
  props: {
    partial: {
      type: Object,
      default: () => ({}),
    },
  },
})
export default class ProcessViewCatalog extends Vue {
  SQUARE_SIZE: number = SQUARE_SIZE;
  spaceCased = spaceCased;

  get availableParts(): PersistentPart[] {
    return parts
      .map(type => ({
        type,
        id: uid(),
        x: -2,
        y: -2,
        rotate: 0,
        settings: {},
        flipped: false,
      }));
  }

  partViewBox(part: PersistentPart): string {
    return settings[part.type].size(part).map(v => v * SQUARE_SIZE).join(' ');
  }

  selectPart(part: PersistentPart) {
    this.$emit('create', { ...part, ...this.$props.partial });
    this.$nextTick(() => this.$emit('close'));
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>Part Catalog</FormToolbar>

    <q-scroll-area style="min-height: 400px; height: 60vh;">
      <q-card-section>
        <q-list style="padding: 5px">
          <q-item
            v-for="part in availableParts"
            :key="part.type"
            dark
            clickable
            @click="selectPart(part)"
          >
            <q-item-section side>
              <svg
                :width="`${SQUARE_SIZE}px`"
                :height="`${SQUARE_SIZE}px`"
                :viewBox="`0 0 ${partViewBox(part)}`"
              >
                <ProcessViewItem :value="part"/>
              </svg>
            </q-item-section>
            <q-item-section>{{ spaceCased(part.type) }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-scroll-area>
  </q-card>
</template>
