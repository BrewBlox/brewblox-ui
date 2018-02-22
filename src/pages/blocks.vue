<template>
  <q-page padding>
    <q-inner-loading :visible="fetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';

import { isFetching } from '../store/blocks/getters';

export default Vue.extend({
  name: 'PageIndex',
  data() {
    return {
      fetching: isFetching(),
    };
  },
  methods: {},
});
</script>
