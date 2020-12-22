<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/bloxfield';
import { roundNumber } from '@/helpers/functional';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { ActuatorPwmBlock } from '@/plugins/spark/types';

@Component
export default class ActuatorPwmWidget
  extends BlockWidgetBase<ActuatorPwmBlock> {

  quickValues = [
    { label: '0%', value: 0 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
  ]

  get outputLink(): Link {
    return this.block.data.actuatorId;
  }

  get isLimited(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }

  updateSetting(value: number): void {
    this.block.data.desiredSetting = value;
    this.saveBlock();
  }

  get pwmDesired(): number | null {
    const v = this.block.data.desiredSetting;
    return v
      ? roundNumber(v, 0)
      : v;
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
        use-presets
        use-range
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!outputLink.id">
        <template #message>
          PWM has no target actuator configured.
        </template>
      </CardWarning>
      <BlockEnableToggle
        :hide-enabled="mode === 'Basic'"
        :crud="crud"
      >
        <template #enabled>
          PWM is enabled and driving <i>{{ outputLink | link }}</i>.
        </template>
        <template #disabled>
          PWM is disabled and not driving <i>{{ outputLink | link }}</i>.
        </template>
      </BlockEnableToggle>

      <div class="widget-body row">
        <div
          v-if="!isDriven"
          class="col-grow row q-mb-sm justify-around q-gutter-xs"
        >
          <div
            v-for="q in quickValues"
            :key="'quick'+q.value"
            class="col-auto clickable rounded-borders"
          >
            <q-btn
              :label="q.label"
              unelevated
              @click="updateSetting(q.value)"
            />
          </div>
        </div>

        <div class="col-break" />

        <q-slider
          v-if="!isDriven"
          :value="pwmDesired"
          class="col-grow q-mt-md q-mx-md'"
          label-always
          color="primary"
          @change="updateSetting"
        />
        <div v-else class="col-grow text-center text-italic fade-3">
          This PWM is driven by a PID block. <br>
          Manual settings are disabled.
        </div>

        <div class="col-break" />

        <div class="col-grow row justify-around text-h6 text-bold">
          <div class="col-auto text-primary">
            Desired: {{ block.data.desiredSetting | round(0) }}%
          </div>
          <div :class="['col-auto text-pink-4', !isLimited && 'fade-4']">
            Limited: {{ block.data.setting | round(0) }}%
          </div>
          <div class="col-auto text-secondary">
            Achieved: {{ block.data.value | round(0) }}%
          </div>
        </div>

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

      <template v-if="mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <DurationField
            :value="block.data.period"
            title="Period"
            label="Period"
            tag="big"
            class="col-grow"
            @input="v => { block.data.period = v; saveBlock(); }"
          />
          <LinkField
            :value="block.data.actuatorId"
            :service-id="serviceId"
            title="target"
            label="Digital Actuator Target"
            class="col-grow"
            @input="v => { block.data.actuatorId = v; saveBlock(); }"
          />
        </div>
      </template>
    </div>
  </GraphCardWrapper>
</template>
