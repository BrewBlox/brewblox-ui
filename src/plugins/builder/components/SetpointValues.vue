<script lang="ts">
import { mdiThermometer } from '@quasar/extras/mdi-v5';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { prettyUnit } from '@/helpers/bloxfield';
import { contrastColor, typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockType, PidBlock, SetpointSensorPairBlock } from '@/plugins/spark/types';

import { settingsAddress, squares } from '../helpers';
import { PersistentPart } from '../types';

@Component
export default class SetpointValues extends Vue {
  icons: Mapped<string> = {};
  squares = squares;

  @Prop({ type: Object, required: true })
  public readonly part!: PersistentPart;

  @Prop({ type: String, default: 'setpoint' })
  public readonly settingsKey!: string;

  @Prop({ type: Number, default: 0 })
  public readonly startX!: number;

  @Prop({ type: Number, default: 0 })
  public readonly startY!: number;

  @Prop({ type: Boolean, default: false })
  public readonly hideUnset!: boolean;

  @Prop({ type: String })
  public readonly backgroundColor!: string;

  created(): void {
    this.icons.mdiThermometer = mdiThermometer;
  }

  get textColor(): string {
    return this.backgroundColor
      ? contrastColor(this.backgroundColor)
      : 'white';
  }

  get address(): BlockAddress {
    return settingsAddress(this.part, this.settingsKey);
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.address.serviceId);
  }

  get block(): SetpointSensorPairBlock | null {
    return this.sparkModule?.blockById(this.address.id) ?? null;
  }

  get isBroken(): boolean {
    return this.block == null
      && this.address.id !== null;
  }

  get isUsed(): boolean {
    return !!this.block
      && this.block.data.settingEnabled
      && this.sparkModule!
        .blocks
        .filter(typeMatchFilter<PidBlock>(BlockType.Pid))
        .some(block => block.data.inputId.id === this.block!.id);
  }

  get isDriven(): boolean {
    return !!this.block
      && this.sparkModule!
        .drivenBlocks
        .includes(this.block.id);
  }

  get setpointSetting(): number | null {
    return this.block && this.isUsed
      ? this.block.data.storedSetting.value
      : null;
  }

  get setpointValue(): number | null {
    return this.block?.data.value.value ?? null;
  }

  get setpointUnit(): string {
    return prettyUnit(this.block?.data.storedSetting);
  }
}
</script>

<template>
  <g
    v-if="block || !hideUnset"
    :transform="`translate(${squares(startX)}, ${squares(startY)})`"
  >
    <SvgEmbedded
      :width="squares(2)"
      :height="squares(1)"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <div v-else class="col column q-ma-xs">
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="icons.mdiThermometer"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ setpointValue | round(1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
        <div class="col row q-gutter-x-xs">
          <q-icon
            :name="isDriven ? 'mdi-swap-vertical-bold' : 'mdi-bullseye-arrow'"
            size="20px"
            class="static col-auto"
          />
          <q-space />
          <div class="col-auto text-bold">
            {{ setpointSetting | round(1) }}
            <small>{{ setpointUnit }}</small>
          </div>
        </div>
      </div>
    </SvgEmbedded>
  </g>
</template>
