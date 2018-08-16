<script lang="ts">
import Component from "vue-class-component";

import BlockComponent from "../BlockComponent";

import { getById } from "@/store/blocks/SetPointSimple/getters";
import { saveBlock } from "@/store/blocks/actions";

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: "",
      type: String
    }
  }
})
/* eslint-enable */
export default class SetPointSimple extends BlockComponent {
  valueInput = 0;

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get setting() {
    return this.block.data.setting;
  }

  get changed() {
    return this.setting.value !== this.valueInput;
  }

  mounted() {
    this.valueInput = this.setting.value;
  }

  save() {
    this.setting.value = this.valueInput;

    saveBlock(this.$store, this.block);
  }
}
</script>

<template>
  <q-card>
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-btn
          :loading="loading"
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="save"
          style="float: right; margin-top: -8px"
        >
          Save
        </q-btn>

        <q-list-header>Settings</q-list-header>
        <q-item>
          <q-item-main>
            <q-input
              v-model="valueInput"
              stack-label="Value"
              placeholder="Value of SetPoint"
              type="number"
              :suffix="setting.unitNotation"
            />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>
