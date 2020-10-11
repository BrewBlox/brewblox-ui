<script lang="ts">
import { Component } from 'vue-property-decorator';

import AutomationItemBase from '../components/AutomationItemBase';
import { AutomationImpl } from '../types';

@Component
export default class AutomationItemUnknown extends AutomationItemBase<AutomationImpl> {

}
</script>

<template>
  <div class="row q-gutter-xs">
    <CardWarning>
      <template #message>
        Unknown type '{{ item.impl.type }}'
      </template>
    </CardWarning>
  </div>
</template>
