<script lang="ts">
import Vue from 'vue';
import { get } from 'lodash';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { blockById } from '@/services/Spark/store/getters';
import { fetchBlock } from '@/services/Spark/store/actions';
import { Block } from '@/services/Spark/state';

import BlockWidget from '@/services/Spark/components/BlockWidget';
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
