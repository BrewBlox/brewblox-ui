<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/store/blocks/actions';

import BlockWidget from '@/components/BlockWidget';

import { SetPointSimpleBlock } from './state';
import { getById } from './getters';

@Component
export default class OneWireTempSensor extends BlockWidget {
  inputMapping = {
    setting: { path: 'block.data.setting.value', default: 0 },
  }

  get block(): SetPointSimpleBlock {
    return getById(this.$store, this.blockId);
  }
}
</script>

<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
        <q-item-tile sublabel>{{ block.type }}</q-item-tile>
      </q-toolbar-title>
    </q-toolbar>

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
