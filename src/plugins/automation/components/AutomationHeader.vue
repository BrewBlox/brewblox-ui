<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class AutomationHeader extends Vue {
  @Prop({ type: String, required: true })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly subtitle!: string;
}
</script>

<template>
  <div class="q-px-sm">
    <div class="text-secondary" style="font-size: 170%">
      {{ title }}
    </div>
    <div class="darkish text-italic">
      {{ subtitle }}
    </div>
  </div>
</template>
