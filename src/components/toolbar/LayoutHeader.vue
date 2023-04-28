<script lang="ts">
import brewbloxLogoSvg from '@/assets/logo-wordmark-dark.svg';
import brewbloxIconSvg from '@/assets/logo-x.svg';
import { useGlobals } from '@/composables';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LayoutHeader',
  emits: ['menu'],
  setup() {
    const { dense } = useGlobals.setup();

    return {
      brewbloxLogoSvg,
      brewbloxIconSvg,
      dense,
    };
  },
});
</script>

<template>
  <q-header class="bg-dark">
    <q-bar class="bg-transparent q-px-none">
      <q-btn
        flat
        round
        icon="menu"
        style="font-size: 80%"
        @click="$emit('menu')"
      />
      <!-- Dense: Home button centered, no title -->
      <template v-if="dense">
        <q-btn
          flat
          rounded
          to="/"
          class="absolute-center"
        >
          <img
            :src="brewbloxIconSvg"
            style="height: 30px"
            class="q-py-xs"
          />
        </q-btn>
      </template>
      <!-- Wide: Home button left, title centered -->
      <template v-else>
        <q-btn
          flat
          rounded
          to="/"
        >
          <img
            :src="brewbloxLogoSvg"
            style="height: 30px"
            class="q-py-xs"
          />
        </q-btn>
        <div
          class="col-auto absolute-center"
          style="font-weight: 500; font-size: 110%"
        >
          <slot name="title" />
        </div>
      </template>
      <q-space />
      <slot name="buttons" />
    </q-bar>
  </q-header>
</template>
