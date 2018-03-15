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
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-rows: 100px;
  justify-content: center;
}
</style>
