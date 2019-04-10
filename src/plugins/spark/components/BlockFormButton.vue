<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { blocks } from '../store/getters';
import { saveBlock } from '../store/actions';
import { formById } from '../../../store/features/getters';
import { Block } from '../state';

@Component({
  props: {
    blockId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    btnProps: {
      type: Object,
      default: {},
    },
  },
})
export default class BlockFormButton extends Vue {
  formOpen = false;
  protected $q: any; // injected by quasar

  get block(): Block {
    return blocks(this.$store, this.$props.serviceId)[this.$props.blockId] || null;
  }

  get blockForm() {
    return formById(this.$store, this.block.type);
  }

  saveBlock(v) {
    saveBlock(this.$store, this.$props.serviceId, v)
      .catch(err => this.$q.notify(err.toString()));
  }
}
</script>

<template>
  <div>
    <q-btn v-bind="btnProps" @click="() => {formOpen = true;}">
      <slot/>
    </q-btn>
    <q-dialog v-model="formOpen" no-backdrop-dismiss>
      <component
        v-if="formOpen"
        :is="blockForm"
        :type="block.type"
        :field="block"
        :on-change-field="v => saveBlock(v)"
        :id="block.id"
        :title="block.id"
        :on-change-block-id="() => {}"
      />
    </q-dialog>
  </div>
</template>
