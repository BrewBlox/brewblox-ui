<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorOffsetBlock } from '@/plugins/spark/features/ActuatorOffset/types';

@Component
export default class ActuatorOffsetForm extends BlockCrudComponent {
  readonly block!: ActuatorOffsetBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />

    <q-card-section>
      <CardWarning v-if="!block.data.targetId.id">
        <template #message>
          Target setpoint is not configured for this setpoint driver.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!block.data.referenceId.id">
        <template #message>
          Reference setpoint is not configured for this setpoint driver.
        </template>
      </CardWarning>
      <BlockEnableToggle
        v-else
        :crud="crud"
        :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
        :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
      />
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Driven block
          </q-item-label>
          <LinkField
            :value="block.data.targetId"
            :service-id="serviceId"
            title="Driven block"
            @input="v => { block.data.targetId = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Offset from
          </q-item-label>
          <div>
            <LinkField
              :value="block.data.referenceId"
              :service-id="serviceId"
              title="Reference block"
              style="display: inline-block"
              @input="v => { block.data.referenceId = v; saveBlock(); }"
            />
            <span class="q-px-xs">&gt;</span>
            <SelectField
              :value="block.data.referenceSettingOrValue"
              :options="[{label: 'Setting', value: 0}, {label: 'Measured value', value: 1}]"
              title="Reference field"
              style="display: inline-block"
              @input="v => { block.data.referenceSettingOrValue = v; saveBlock(); }"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>
            Target Offset
          </q-item-label>
          <InputField
            :readonly="isDriven"
            :value="block.data.desiredSetting"
            tag="big"
            title="Target offset"
            type="number"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>
            Current offset
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
