<template>
  <div class="darkPage">
    <span>Flows</span>   
    <Grid></Grid>
  </div>
</template>
<script>
import {
} from 'quasar';
import Grid from './Grid.vue';
import axios from 'axios';

export default {
  name: 'index',
  components: {
    Grid,
  },
  data() {
    return {
      text: 'loading',
      layout: {},
    };
  },
  computed: {
  },
  methods: {
  },
  mounted() {
    axios.get('api/grids/herms-automated-valves')
      .then((response) => {
        this.text = JSON.stringify(response.data, null, 2);
        this.layout = response.data;
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
.darkPage{
  background-color: #24333D;
  height: calc(100vh - 50px);
  color: white;
}
</style>
