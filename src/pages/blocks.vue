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
        :key="block"
        :block-id="block"
      />
    </template>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../css/themes/dark.variables.styl';

.q-card {
  background: $block-background;
  margin-bottom: 20px;
}
</style>

<script lang="ts">
import Vue from 'vue';

import Block from '@/components/blocks/block';

import { isFetching, blockIds } from '@/store/blocks/getters';

export default Vue.extend({
  name: 'PageIndex',
  components: { Block },
  computed: {
    blocks(): string[] {
      return blockIds(this.$store);
    },
    fetching(): boolean {
      return isFetching(this.$store);
    },
  },
  methods: {},
});
</script>
