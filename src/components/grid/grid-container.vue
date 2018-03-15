<template>
  <div class="grid-container">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'GridContainer',
};
</script>

<style scoped>
.grid-container {
  background-color: transparent;
  display: grid;
  grid-gap: 12px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-rows: 100px;
  grid-auto-flow: dense;
  justify-content: center;
}
</style>
