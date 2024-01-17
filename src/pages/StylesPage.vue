<script setup lang="ts">
const colors = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey',
];

document.title = 'Brewblox | Style Guide';
</script>

<template>
  <q-page padding>
    <div class="q-gutter-md row items-start">
      <q-card
        v-for="color in colors"
        :key="color"
        flat
        class="color"
      >
        <q-card-section
          class="flex flex-center text-white"
          :class="'bg-' + color"
        >
          {{ color }}
        </q-card-section>

        <div
          v-for="n in 14"
          :key="n"
          class="detailed-color column flex-center"
          :class="[`bg-${color}-${n}`, n < 8 && 'text-black']"
        >
          {{ color }}-{{ n }}
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.color
  width: 135px
.detailed-color
  height: 40px
</style>
