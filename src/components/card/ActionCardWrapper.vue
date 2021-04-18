<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActionCardWrapper',
});
</script>

<template>
  <CardWrapper no-scroll>
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <ActionCardBody>
      <slot />
      <template #actions>
        <slot name="actions" />
      </template>
    </ActionCardBody>
  </CardWrapper>
</template>
