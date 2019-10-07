<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../../components/BlockCrudComponent';
import { ActuatorOffsetBlock } from './types';

@Component
export default class ActuatorOffsetBasic extends BlockCrudComponent {
  readonly block!: ActuatorOffsetBlock;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item dark class="align-children">
        <q-item-section>
          <q-item-label caption>
            Target offset
          </q-item-label>
          <big>{{ block.data.desiredSetting | round }}</big>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Actual offset
          </q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
          <ConstraintsField
            :value="block.data.constrainedBy"
            :service-id="serviceId"
            type="analog"
            @input="v => { block.data.constrainedBy = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
