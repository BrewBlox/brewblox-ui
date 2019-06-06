<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class UnknownBlockForm extends BlockForm {
}
</script>

<template>
  <div dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
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
