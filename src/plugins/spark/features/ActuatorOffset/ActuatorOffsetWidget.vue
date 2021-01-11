<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/bloxfield';
import { round } from '@/helpers/functional';
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

  get target(): Link {
    return this.block.data.targetId;
  }

  get reference(): Link {
    return this.block.data.referenceId;
  }

  get refKind(): string {
    return this.referenceOpts
      .find(v => v.value === this.block.data.referenceSettingOrValue)
      ?.label
      ?? '???';
  }

  get isLimited(): boolean {
    const { enabled, desiredSetting, setting } = this.block.data;
    return enabled
      && round(desiredSetting, 1) !== round(setting, 1);
  }
}
</script>

<template>
  <GraphCardWrapper
    :show="inDialog"
    v-bind="{context}"
  >
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
      <BlockEnableToggle
        :crud="crud"
        :hide-enabled="mode === 'Basic'"
      >
        <template #enabled>
          Driver is enabled and driving <i>{{ target | link }}</i>, based on the
          {{ refKind }} of <i>{{ reference | link }}</i>.
        </template>
        <template #disabled>
          Driver is disabled and not driving <i>{{ target | link }}</i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <InputField
          :readonly="isDriven"
          :value="block.data.desiredSetting"
          tag="big"
          title="Desired offset"
          label="Desired offset"
          type="number"
          class="col-grow"
          tag-class="text-primary"
          @input="v => { block.data.desiredSetting = v; saveBlock(); }"
        />
        <LabeledField
          :value="block.data.setting"
          number
          label="Limited offset"
          tag="big"
          class="col-grow"
          :tag-class="['text-pink-4', !isLimited && 'fade-4']"
        />
        <LabeledField
          :value="block.data.value"
          number
          label="Achieved offset"
          tag="big"
          class="col-grow"
          tag-class="text-secondary"
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
