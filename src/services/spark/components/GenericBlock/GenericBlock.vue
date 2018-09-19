<script lang="ts">
import Vue from 'vue';
import { get } from 'lodash';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { blockById } from '@/services/spark/store/getters';
import { fetchBlock } from '@/services/spark/store/actions';
import { Block } from '@/services/spark/state';

import BlockWidget from '@/services/spark/components/BlockWidget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';

@Component({
  components: {
    WidgetToolbar,
  },
})
export default class GenericBlock extends BlockWidget { }
</script>

<template>
  <div>

    <widget-toolbar
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
