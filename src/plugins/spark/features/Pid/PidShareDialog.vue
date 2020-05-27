<script lang="ts">
import pick from 'lodash/pick';
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { durationMs, unitDurationString } from '@/helpers/functional';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { ActuatorOffsetBlock, Block, PidBlock, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';
import { featureStore } from '@/store/features';

interface BlockDisplay {
  role: string;
  block: Block | null;
  typeName: string;
  notes: Mapped<any>;
}

@Component
export default class PidShareDialog extends DialogBase {
  presets = defaultPresets();
  params: QueryParams | null = null;

  @Ref()
  readonly viewparent!: HTMLElement;

  @Ref()
  readonly graph!: HistoryGraph;

  @Prop({ type: String, required: true })
  public readonly graphId!: string;

  @Prop({ type: Object, required: true })
  public readonly block!: PidBlock;

  @Prop({ type: Object, required: true })
  public readonly graphCfg!: GraphConfig;

  get activeGraphCfg(): GraphConfig {
    return {
      ...this.graphCfg,
      params: this.params ?? this.graphCfg.params,
    };
  }

  get serviceId(): string {
    return this.block.serviceId;
  }

  get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  applyParams(params: QueryParams): void {
    this.params = { ...params };
    this.$nextTick(() => this.graph?.resetSources());
  }

  chooseDuration(): void {
    const current = this.activeGraphCfg.params.duration ?? '1h';
    createDialog({
      component: 'TimeUnitDialog',
      parent: this,
      title: 'Custom graph duration',
      value: new Unit(durationMs(current), 'ms'),
      label: 'Duration',
    })
      .onOk(unit => this.applyParams({ duration: unitDurationString(unit) }));
  }

  name(block: Block | null): string {
    return block !== null
      ? featureStore.widgetTitle(block.type)
      : 'Not set';
  }

  get driveChains(): string[][] {
    return this.sparkModule.drivenChains;
  }

  get pidData(): Mapped<any> {
    return pick(this.block.data, 'enabled', 'outputSetting', 'p', 'i', 'd');
  }

  get input(): SetpointSensorPairBlock | null {
    return this.sparkModule.blockById(this.block.data.inputId.id);
  }

  get inputData(): Mapped<any> {
    if (this.input === null) {
      return {};
    }
    return [
      `ID: ${this.input.id}`,
    ];
  }

  get driver(): ActuatorOffsetBlock | null {
    if (this.input === null) {
      return null;
    }
    const chain = this.driveChains.find(chain => chain[0] === this.input!.id);
    return this.sparkModule.blockById(chain?.[1] ?? null);
  }

  get driverData(): Mapped<any> {
    if (this.driver === null) {
      return {};
    }
    return pick(this.driver.data, 'referenceSettingOrValue');
  }

  get output(): Block | null {
    return this.sparkModule.blockById(this.block.data.outputId.id);
  }

  get outputData(): Mapped<any> {
    if (this.output === null) {
      return {};
    }
    return {};
  }

  get actuator(): Block | null {
    return this.sparkModule.blockById(this.output?.data.actuatorId?.id ?? null);
  }

  get actuatorData(): Mapped<any> {
    if (this.actuator === null) {
      return {};
    }
    return {};
  }

  get displays(): BlockDisplay[] {
    return [
      {
        role: 'Driver',
        block: this.driver,
        typeName: this.name(this.driver),
        notes: this.driverData,
      },
      {
        role: 'Input',
        block: this.input,
        typeName: this.name(this.input),
        notes: this.inputData,
      },
      {
        role: 'PID',
        block: this.block,
        typeName: this.name(this.block),
        notes: this.pidData,
      },
      {
        role: 'Output',
        block: this.output,
        typeName: this.name(this.output),
        notes: this.outputData,
      },
      {
        role: 'Actuator',
        block: this.actuator,
        typeName: this.name(this.actuator),
        notes: this.actuatorData,
      },
    ];
  }

  showBlock(block: Block): void {
    createBlockDialog(block);
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized @hide="onDialogHide">
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="block.id">
          <template #buttons>
            <q-btn-dropdown stretch auto-close flat label="timespan" icon="mdi-timelapse">
              <ActionItem
                v-for="(preset, idx) in presets"
                :key="idx"
                :active="activeGraphCfg.params.duration === preset.duration"
                :label="preset.duration"
                @click="applyParams(preset)"
              />
              <ActionItem label="Custom" @click="chooseDuration" />
            </q-btn-dropdown>
          </template>
        </DialogToolbar>
      </template>
    </CardWrapper>

    <div class="fit row">
      <div class="col-3 q-pa-md column q-gutter-y-sm sidebar">
        <div v-for="d in displays" :key="d.role" class="col">
          <q-btn
            :disable="d.block === null"
            flat
            icon="mdi-launch"
            class="float-right z-top"
            @click="showBlock(d.block)"
          >
            <q-tooltip v-if="d.block">
              Open in dialog
            </q-tooltip>
          </q-btn>
          <div class="text-h6 darkish">
            {{ d.role }} ({{ d.typeName }})
          </div>
          <div v-if="d.block" class="text-italic" style="font-size: 120%">
            {{ d.block.id }}
          </div>
        </div>
      </div>
      <q-separator vertical inset />
      <HistoryGraph
        ref="graph"
        class="col"
        :graph-id="graphId"
        :config="activeGraphCfg"
        use-presets
        @params="applyParams"
      />
    </div>
  </q-dialog>
</template>

<style scoped>
.sidebar > div {
  width: 100%;
  border: 1px dashed silver;
  padding: 5px;
}
</style>
