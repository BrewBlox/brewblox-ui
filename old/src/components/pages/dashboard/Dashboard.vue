<template>
  <div>
      <span>Dashboard</span>
      <br>
      <w-pid />
  </div>
</template>

<script>
import {
} from 'quasar';
import WPid from '../../widgets/WPid.vue';

export default {
  name: 'index',
  components: {
    WPid,
  },
  data() {
    return {
    };
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
