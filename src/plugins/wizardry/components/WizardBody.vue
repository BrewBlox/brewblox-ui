<template>
  <div class="fit column">
    <q-scroll-area visible class="col">
      <slot />
    </q-scroll-area>
    <div v-if="$slots.actions" class="col-auto">
      <q-separator />
      <q-card-actions align="right">
        <slot name="actions" />
      </q-card-actions>
    </div>
  </div>
</template>
