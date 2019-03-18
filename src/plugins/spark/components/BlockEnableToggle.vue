<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component({
  props: {
    textEnabled: {
      type: String,
      required: false,
      default: "This block is enabled",
    },
    textDisabled: {
      type: String,
      required: false,
      default: "This block is disabled",
    },
  },
})
export default class BlockEnableToggle extends BlockForm {
  get mainText() {
    return this.block.data.enabled ? this.$props.textEnabled : this.$props.textDisabled;
  }
}
</script>

<template>
  <q-item>
    <q-item-main>
      <p>{{ mainText }}</p>
    </q-item-main>
    <q-item-side right>
      <q-btn
        v-if="block.data.enabled"
        label="Disable"
        color="negative"
        dense
        @click="() => { block.data.enabled = false; saveBlock(); }"
      />
      <q-btn
        v-if="!block.data.enabled"
        label="Enable"
        color="positive"
        dense
        @click="() => { block.data.enabled = true; saveBlock(); }"
      />
    </q-item-side>
  </q-item>
</template>
