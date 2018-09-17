<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '../actions';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';
import BlockWidget from '../BlockWidget.ts';
import { SetPointSimpleBlock } from './state';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
export default class OneWireTempSensor extends BlockWidget {
  inputMapping = {
    setting: { path: 'block.data.setting.value', default: 0 },
  };

  get block(): SetPointSimpleBlock {
    return getById(this.$store, this.blockId);
  }
}
</script>

<template>
  <div>

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-card-main>
        <q-list>

          <q-item class="grid-items-2">

            <q-item-main>
              <q-item-tile sublabel>Setting</q-item-tile>
              <q-input
                v-model="inputs.setting"
                type="number"
                :suffix="block.data.setting.unitNotation"
                numeric-keyboard-toggle
              />
            </q-item-main>

          </q-item>

        </q-list>
      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-items-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}

.q-item-section {
  margin-left: 0;
}

.modal .q-list {
  border: 0;
}
</style>
