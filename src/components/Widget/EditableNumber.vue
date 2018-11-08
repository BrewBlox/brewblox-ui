<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  props: {
    block: {
      type: Object,
      required: true,
    },
    keyName: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
      default: '',
    },
  },
})
export default class EditableNumber extends Vue {
  placeholder = 0;

  get blockData() {
    console.log(this.$props.block.data);
    return this.$props.block.data;
  }

  get notation() {
    return this.blockData[this.$props.keyName].notation;
  }

  get value() {
    return this.blockData[this.$props.keyName].value;
  }

  startEdit() {
    this.placeholder = this.blockData[this.$props.keyName].value;
  }
  endEdit() {
    const blockCopy = this.$props.block;
    blockCopy.data[this.$props.keyName].value = this.placeholder;
    this.$emit('updated:block', blockCopy);
  }
}
</script>

<template>
  <div>
    <big class="editable">{{ blockData[this.$props.keyName] | unit }}</big>
    <q-popup-edit
      buttons
      persistent
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      @show="startEdit"
      @save="endEdit"
    >
    <q-input
        type="number"
        :suffix="this.notation"
        v-model="placeholder"
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
