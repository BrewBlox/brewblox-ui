<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component({
  props: {
    text: {
      type: String,
      required: false,
      default: "This block is ",
    },
  },
})
export default class BlockEnableToggle extends BlockForm {
}
</script>

<template>
  <q-item>
    <q-item-main>
      {{ $props.text }}
      <b v-if="block.data.enabled">enabled</b>
      <b v-if="!block.data.enabled">disabled</b>.
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
