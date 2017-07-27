<template>
  <div>
    <span>Flows</span>   
    <Grid></Grid>
  </div>
</template>
<script>
import {
} from 'quasar';
import api from '../api';
import Grid from '../components/Grid.vue';

export default {
  name: 'index',
  components: {
    Grid,
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
