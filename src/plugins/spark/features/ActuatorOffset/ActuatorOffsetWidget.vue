<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxLink, JSLink } from '@/helpers/bloxfield';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { ActuatorOffsetBlock, ReferenceKind } from '@/plugins/spark/types';

@Component
export default class ActuatorOffsetWidget
  extends BlockWidgetBase<ActuatorOffsetBlock> {

  referenceOpts: SelectOption<ReferenceKind>[] = [
    { label: 'Setting', value: ReferenceKind.REF_SETTING },
    { label: 'Measured', value: ReferenceKind.REF_VALUE },
  ]

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }

  get target(): JSLink {
    return bloxLink(this.block.data.targetId);
  }

  get reference(): JSLink {
    return bloxLink(this.block.data.referenceId);
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-range
        use-presets
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!target.id">
        <template #message>
          Setpoint Driver has no target Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!reference.id">
        <template #message>
          Setpoint Driver has no reference Setpoint configured.
        </template>
      </CardWarning>
      <CardWarning v-else-if="!block.data.enabled">
        <template #message>
          <span>
            Setpoint Driver is disabled:
            <i>{{ target }}</i> will not be changed.
          </span>
        </template>
        <template #actions>
          <q-btn text-color="white" flat label="Enable" @click="enable" />
        </template>
      </CardWarning>
      <BlockEnableToggle
        v-else
        :crud="crud"
        :text-enabled="`Offset is enabled: ${target} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${reference}.`"
        :text-disabled="`Offset is disabled: ${target} will not be changed.`"
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
            :options="referenceOpts"
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
