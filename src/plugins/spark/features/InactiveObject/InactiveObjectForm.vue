<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class InactiveObjectForm extends BlockForm {
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
  </q-card>
</template>
