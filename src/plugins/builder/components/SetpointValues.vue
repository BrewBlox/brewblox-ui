<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { contrastColor } from '@/helpers/functional';
import { SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
import { sparkStore } from '@/plugins/spark/store';

import { blockTypes } from '../../spark/block-types';
import { settingsBlock, settingsLink, squares } from '../helpers';
import { PersistentPart } from '../types';

@Component
export default class SetpointValues extends Vue {
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

  get textColor(): string {
    return this.backgroundColor
      ? contrastColor(this.backgroundColor)
      : 'white';
  }

  get block(): SetpointSensorPairBlock | null {
    return settingsBlock(this.part, this.settingsKey);
  }

  get isUsed(): boolean {
    return !!this.block
      && this.block.data.settingEnabled
      && sparkStore.blockValues(this.block.serviceId)
        .some(block =>
          block.type === blockTypes.Pid
          && block.data.inputId.id === (this.block as SetpointSensorPairBlock).id);
  }

  get isDriven(): boolean {
    return !!this.block
      && sparkStore.drivenBlocks(this.block.serviceId)
        .includes(this.block.id);
  }

  get isBroken(): boolean {
    if (this.block) {
      return false;
    }
    const link = settingsLink(this.part, this.settingsKey);
    return !!link.serviceId && !!link.blockId;
  }

  get setpointSetting(): number | null {
    return this.block && this.isUsed
      ? this.block.data.storedSetting.value
      : null;
  }

  get setpointValue(): number | null {
    return this.block
      ? this.block.data.value.value
      : null;
  }

  get setpointUnit(): string {
    return this.block
      ? this.block.data.storedSetting.notation
      : '';
  }
}
</script>

<template>
  <g v-if="block || !hideUnset" :transform="`translate(${squares(startX)}, ${squares(startY)})`">
    <SvgEmbedded :width="squares(2)" :height="squares(1)">
      <BrokenIcon v-if="isBroken" />
      <UnlinkedIcon v-else-if="!block" />
      <div v-else class="col column q-ma-xs">
        <div class="col row q-gutter-x-xs">
          <q-icon
            name="mdi-thermometer"
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
