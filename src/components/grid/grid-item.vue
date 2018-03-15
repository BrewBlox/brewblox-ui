<template>
  <div
    class="grid-item"
    :style="style"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'GridItem',
  props: {
    cols: {
      type: String,
      default: () => 1,
    },
    rows: {
      type: String,
      default: () => 1,
    },
  },
  data() {
    const { cols, rows } = this.$props;

    return {
      style: `
        grid-column-end: span ${parseInt(cols, 10)};
        grid-row-end: span ${parseInt(rows, 10)};
      `,
    };
  },
};
</script>

<style scoped>
.grid-item {}
</style>
