<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

@Component
export default class InactiveObjectForm extends BlockCrudComponent {
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockWidgetDialogToolbar :crud="crud" />
  </q-card>
</template>
