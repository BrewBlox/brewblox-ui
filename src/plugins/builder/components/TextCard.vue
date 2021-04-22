<script lang="ts">
import { computed, defineComponent } from 'vue';



@Component
export default class TextCard extends PartCard {

  @Prop({ type: String, default: 'text' })
  public readonly settingsKey!: string;

  @Prop({ type: String, default: 'Text field' })
  public readonly label!: string;

  get text(): string {
    return this.part.settings[this.settingsKey] || '';
  }

  set text(val: string) {
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: val });
  }
}
</script>

<template>
  <InputField
    v-model="text"
    :title="label"
    :label="label"
    item-aligned
  />
</template>
