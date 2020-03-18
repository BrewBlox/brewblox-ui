<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { ActuatorOffsetBlock } from './types';

@Component
export default class ActuatorOffsetWidget
  extends BlockWidgetBase<ActuatorOffsetBlock> {

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.targetId.id">
        <template #message>
          Setpoint Driver has no target Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!block.data.referenceId.id">
        <template #message>
          Setpoint Driver has no reference Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!block.data.enabled">
        <template #message>
          <span>
            Setpoint Driver is disabled:
            <i>{{ block.data.targetId }}</i> will not be changed.
          </span>
        </template>
        <template #actions>
          <q-btn text-color="white" flat label="Enable" @click="enable" />
        </template>
      </CardWarning>
      <BlockEnableToggle
        v-else
        :crud="crud"
        :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
        :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
      />

      <div class="widget-body row">
        <InputField
          :readonly="isDriven"
          :value="block.data.desiredSetting"
          tag="big"
          title="Target offset"
          label="Target offset"
          type="number"
          class="col-grow"
          @input="v => { block.data.desiredSetting = v; saveBlock(); }"
        />
        <LabeledField
          :value="block.data.value"
          number
          label="Actual offset"
          tag="big"
          class="col-grow"
        />

        <template v-if="mode === 'Full'">
          <div class="col-break" />

          <LinkField
            :value="block.data.targetId"
            :service-id="serviceId"
            title="Driven block"
            label="Driven block"
            class="col-grow"
            @input="v => { block.data.targetId = v; saveBlock(); }"
          />
          <LinkField
            :value="block.data.referenceId"
            :service-id="serviceId"
            title="Reference block"
            label="Reference block"
            class="col-grow"
            @input="v => { block.data.referenceId = v; saveBlock(); }"
          />
          <SelectField
            :value="block.data.referenceSettingOrValue"
            :options="[{label: 'Setting', value: 0}, {label: 'Measured', value: 1}]"
            title="Reference field"
            label="Reference field"
            class="col-grow"
            @input="v => { block.data.referenceSettingOrValue = v; saveBlock(); }"
          />
        </template>

        <div class="col-break" />

        <DrivenIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
        <ConstraintsField
          :value="block.data.constrainedBy"
          :service-id="serviceId"
          type="analog"
          class="col-grow"
          @input="v => { block.data.constrainedBy = v; saveBlock(); }"
        />
      </div>
    </div>
  </GraphCardWrapper>
</template>
