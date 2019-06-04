<script lang="ts">
import Component from 'vue-class-component';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class UnknownBlockForm extends BlockForm {
}
</script>

<template>
  <div dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-card-section>
      <q-item dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>Unknown or invalid Block</q-item-section>
      </q-item>
    </q-card-section>
  </div>
</template>
