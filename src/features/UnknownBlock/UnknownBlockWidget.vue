<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget/BlockWidget';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
export default class UnknownBlockWidget extends BlockWidget {
}
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
