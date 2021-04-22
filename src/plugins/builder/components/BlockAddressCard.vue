<script lang="ts">
import { computed, defineComponent } from 'vue';

import { BlockAddress } from '@/plugins/spark/types';

import { settingsAddress } from '@/plugins/builder/utils';
import PartCard from './PartCard';

@Component
export default class BlockAddressCard extends PartCard {

  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Array, required: true })
  public readonly compatible!: string[];

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Boolean, default: true })
  public readonly creatable!: boolean;

  get address(): BlockAddress {
    return settingsAddress(this.part, this.settingsKey);
  }

  set address(addr: BlockAddress) {
    this.savePartSettings({
      ...this.part.settings,
      [this.settingsKey]: { ...addr },
    });
  }
}
</script>

<template>
  <BlockAddressField
    v-model="address"
    v-bind="{label, compatible, creatable}"
    item-aligned
    any-service
  />
</template>
