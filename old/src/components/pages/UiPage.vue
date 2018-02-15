<template>
<div class="ui-page">
  <component :is="template" />
</div>
</template>

<script>

import VueTypes from 'vue-types';


const pageTypes = {
  processgrid: () => import('./grid'),
  chart: () => import('./chart'),
  dashboard: () => import('./dashboard'),
};

export default {
  name: 'ui-page',
  components: {
    ...pageTypes,
  },
  data() {
    return {
    };
  },
  props: {
    template: VueTypes.string.isRequired,
    slug: VueTypes.string.isRequired,
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
};
</script>

<style lang="stylus">
</style>
