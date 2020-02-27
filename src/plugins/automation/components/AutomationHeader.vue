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
    <div class="row">
      <div class="col-grow text-secondary" style="font-size: 170%">
        {{ title }}
      </div>
      <div class="col-auto">
        <slot name="buttons" />
        <ActionMenu round dense class="col-auto">
          <template #actions>
            <slot name="actions" />
          </template>
        </ActionMenu>
      </div>
    </div>
    <div class="darkish text-italic">
      {{ subtitle }}
    </div>
  </div>
</template>
