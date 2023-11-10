<script setup lang="ts">
import { computed } from 'vue';
import { colorString } from '@/plugins/builder/utils';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/BeerBottle';
import { usePart } from '../composables';
import { COLOR_KEY } from '../const';

const { settings, width, height } = usePart.setup();

const color = computed<string>(() => colorString(settings.value[COLOR_KEY]));
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 100"
  >
    <g transform="translate(5, 24)">
      <path
        :fill="color"
        :stroke="color"
        d="M5,70
          V34
          c0-1.5,1.2-3.6,2.4-5.6
          c1.5-2.7,3.2-5.7,3.3-9
          L11.4,5
          h2.3
          l0.7,14.4
          c0,3.3,1.8,6.3,3.3,9
          c1.2,2,2.4,4.1,2.4,5.6
          v36
          H5
          z"
      />
      <g class="outline">
        <path
          d="M24,34
            v36.3
            c0,2.1-1,3.8-2.3,3.8
            H3.3
            C2,74,1,72.3,1,70.3
            V34
            c0-5,5.6-10,5.6-14.7
            L7.6,1
            h9.9
            l0.9,18.3
            C18.4,24,24,29,24,34
            z"
        />
      </g>
    </g>
    <BuilderInteraction :height="100">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ColorMenuContent />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
