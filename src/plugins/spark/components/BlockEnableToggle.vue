<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component({
  props: {
    textEnabled: {
      type: String,
      default: 'This block is enabled',
    },
    textDisabled: {
      type: String,
      default: 'This block is disabled',
    },
  },
})
export default class BlockEnableToggle extends BlockForm {
  get enabled() {
    return Boolean(this.block.data.enabled);
  }

  get mainText() {
    return this.enabled
      ? this.$props.textEnabled
      : this.$props.textDisabled;
  }

  toggleEnabled() {
    this.block.data.enabled = !this.enabled;
    this.saveBlock();
  }
}
</script>

<template>
  <q-item dark>
    <q-item-section>{{ mainText }}</q-item-section>
    <q-item-section side>
      <q-btn
        :label="enabled ? 'Disable': 'Enable'"
        :color="enabled ? 'negative' : 'positive'"
        outline
        dense
        @click="toggleEnabled"
      />
    </q-item-section>
  </q-item>
</template>
