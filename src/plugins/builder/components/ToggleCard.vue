<script lang="ts">
import { computed, defineComponent } from 'vue';



@Component
export default class ToggleCard extends PartCard {

  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Boolean, default: false })
  public readonly defaultValue!: boolean;

  @Prop({ type: String, required: true })
  public readonly label!: string;

  get value(): boolean {
    return Boolean(this.part.settings[this.settingsKey] ?? this.defaultValue);
  }

  set value(v: boolean) {
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: v });
  }
}
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-toggle v-model="value" />
    </q-item-section>
  </q-item>
</template>
