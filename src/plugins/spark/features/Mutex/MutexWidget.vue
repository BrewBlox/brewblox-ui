<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { MutexBlock } from '@/plugins/spark/types';

import MutexBasic from './MutexBasic.vue';
import MutexFull from './MutexFull.vue';

@Component({
  components: {
    Basic: MutexBasic,
    Full: MutexFull,
  },
})
export default class MutexWidget
  extends BlockWidgetBase<MutexBlock> {
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
    @dblclick="toggleMode"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <component :is="mode" :crud="crud" />
  </CardWrapper>
</template>
