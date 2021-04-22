<script lang="ts">
import { computed, defineComponent } from 'vue';

import PartCard from './PartCard';


@Component
export default class BorderCard extends PartCard {

  @Prop({ type: String, default: 'bordered' })
  public readonly settingsKey!: string;

  @Prop({ type: String, default: 'Show border' })
  public readonly label!: string;

  @Prop({ type: Boolean, default: true })
  public readonly defaultValue!: boolean;

}
</script>

<template>
  <ToggleCard v-bind="{...$attrs, ...$props}" v-on="$listeners" />
</template>
