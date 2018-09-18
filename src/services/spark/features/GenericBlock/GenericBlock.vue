<script lang="ts">
import Vue from 'vue';
import { get } from 'lodash';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { blockById } from '@/services/spark/store/getters';
import { fetchBlock } from '@/services/spark/store/actions';
import { Block } from '@/services/spark/state';

import BlockWidget from '../BlockWidget';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
export default class GenericBlock extends BlockWidget { }
</script>

<template>
  <div>

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-item>
        <pre>{{ block.data }}</pre>
      </q-item>
    </q-card>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
