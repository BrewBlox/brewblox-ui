<template>
  <div>
    <span>Flows</span>
    <div><pre>{{text}}</pre></div>
  </div>
</template>

<script>
import {
} from 'quasar';
import api from '../api';

export default {
  name: 'index',
  components: {
  },
  data() {
    return {
      text: 'loading',
    };
  },
  computed: {
  },
  methods: {
  },
  mounted() {
    api.get('/grids/herms-automated-valves')
      .then((response) => {
        this.text = JSON.stringify(response.data, null, 2);
      })
      .catch((error) => {
        this.text = error;
      });
  },
  beforeDestroy() {
  },
};
</script>

<style lang="stylus">
</style>
