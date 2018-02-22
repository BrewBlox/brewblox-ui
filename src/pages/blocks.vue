<template>
  <q-page padding>
    <q-inner-loading :visible="fetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="blocks.length > 0">
      <block
        v-for="block in blocks"
        :key="block.id"
        :block-data="block"
      />
    </template>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';

import Block from '../components/blocks/block';

import { isFetching, allBlocks } from '../store/blocks/getters';

export default Vue.extend({
  name: 'PageIndex',
  components: { Block },
  computed: {
    blocks: () => allBlocks(),
    fetching: () => isFetching(),
  },
  methods: {},
});
</script>
