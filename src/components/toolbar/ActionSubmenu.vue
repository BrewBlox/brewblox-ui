<script setup lang="ts">
interface Props {
  label?: string | null;
}

withDefaults(defineProps<Props>(), {
  label: null,
});
</script>

<template>
  <div class="col-auto column no-wrap">
    <div
      v-if="!!label"
      class="col-auto q-py-sm q-px-md text-italic text-grey-5"
      style="font-size: 120%"
    >
      {{ label }}
    </div>
    <slot />
  </div>
</template>
