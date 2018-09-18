<script lang="ts">
import Component from 'vue-class-component';

import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import { saveBlock } from '@/services/spark/store/actions';
import { getAll as getAllSensorSetPointPairs } from '../SensorSetPointPair/getters';
import BlockWidget from '@/services/spark/components/BlockWidget';
import { PidBlock, PidSettings, PidLinks, PidFiltering, PidState }
  from './state';
import { getById } from './getters';
import { refresh } from './actions';

/* eslint-disable indent */
@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
  },
})
/* eslint-enable */
export default class PidWidget extends BlockWidget {
  inputMapping = {
    kp: { path: 'settings.kp', default: 0 },
    ti: { path: 'settings.ti', default: 0 },
    td: { path: 'settings.td', default: 0 },
    linkInput: { path: 'links.input', default: '' },
    linkOutput: { path: 'links.output', default: '' },
    filteringInput: { path: 'filtering.input', default: 0 },
    filteringDerivative: { path: 'filtering.derivative', default: 0 },
  };

  modalOpen: boolean = false;

  get block(): PidBlock {
    return getById(this.$store, this.blockId);
  }

  get settings(): PidSettings {
    return this.block.data.settings;
  }

  get links(): PidLinks {
    return this.block.data.links;
  }

  get filtering(): PidFiltering {
    return this.block.data.filtering;
  }

  get state(): PidState {
    return this.block.data.state;
  }

  get allSensorSetPointPairs(): { label: string, value: string }[] {
    return getAllSensorSetPointPairs(this.$store, this.block.serviceId)
      .map(setpoint => ({ label: setpoint.id, value: setpoint.id }));
  }

  get kpChanged() {
    return this.settings.kp !== this.inputs.kp;
  }

  closeModal() {
    this.modalOpen = false;
  }

  openModal() {
    this.modalOpen = true;
  }

  refreshState() {
    refresh(this.$store, this.block);
  }

  updateKP() {
    saveBlock(this.$store, {
      ...this.block,
      data: {
        ...this.block.data,
        settings: {
          ...this.block.data.settings,
          kp: this.inputs.kp,
        },
      },
    });
  }

  randomKP() {
    saveBlock(this.$store, {
      ...this.block,
      data: {
        ...this.block.data,
        settings: {
          ...this.block.data.settings,
          kp: Math.round(Math.random() * 15),
        },
      },
    });
  }

  save() {
    this.block.data = {
      settings: {
        kp: this.inputs.kp,
        td: this.inputs.td,
        ti: this.inputs.ti,
      },
      links: {
        input: this.inputs.linkInput,
        output: this.inputs.linkOutput,
      },
      filtering: {
        input: this.inputs.filteringInput,
        derivative: this.inputs.filteringDerivative,
      },
      state: this.block.data.state,
    };

    saveBlock(this.$store, this.block);
  }
}
</script>

<template>
  <div>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
      :on-settings="openModal"
    />

    <q-card>
      <q-list>
        <q-item class="grid-items-2">
          <q-item-side>
            <q-item-tile sublabel>Input</q-item-tile>
            <q-item-tile
              label
              class="q-headline"
            >
              {{ state.inputValue }}
            </q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>Setpoint</q-item-tile>
            <q-item-tile
              label
              class="q-headline"
            >
              {{ state.inputSetting }}
            </q-item-tile>
          </q-item-side>
        </q-item>
        <q-item-separator />
        <q-item class="grid-items-3">
          <q-item-side>
            <q-item-tile sublabel>P</q-item-tile>
            <q-item-tile label>{{ state.p }}</q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>I</q-item-tile>
            <q-item-tile label>{{ state.i }}</q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>D</q-item-tile>
            <q-item-tile label>{{ state.d }}</q-item-tile>
          </q-item-side>
        </q-item>
        <q-item-separator />
        <q-item>
          <q-item-side>
            <q-item-tile sublabel>Output</q-item-tile>
            <q-item-tile
              label
              class="q-display-2"
            >
              {{ state.outputValue }}
            </q-item-tile>
          </q-item-side>
        </q-item>
      </q-list>
    </q-card>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      title="PID Settings"
    >

      <q-list>
        <q-list-header>Settings</q-list-header>
        <q-item class="grid-items-3">
          <q-item-main>
            <q-input
              v-model="inputs.kp"
              stack-label="KP"
              placeholder="KP of PID"
              type="number"
            />
          </q-item-main>
          <q-item-main>
            <q-input
              v-model="inputs.ti"
              stack-label="TI"
              placeholder="TI of PID"
              type="number"
            />
          </q-item-main>
          <q-item-main>
            <q-input
              v-model="inputs.td"
              stack-label="TD"
              placeholder="TD of PID"
              type="number"
            />
          </q-item-main>
        </q-item>
        <q-item-separator />
        <q-list-header>Links</q-list-header>
        <q-item class="grid-items-2">
          <q-item-main>
            <q-select
              v-model="inputs.linkInput"
              stack-label="Input"
              placeholder="Input of PID"
              clearable
              :options="allSensorSetPointPairs"
            />
          </q-item-main>
          <q-item-main>
            <q-select
              v-model="inputs.linkOutput"
              stack-label="Output"
              placeholder="Output of PID"
              clearable
              :options="allSensorSetPointPairs"
            />
          </q-item-main>
        </q-item>
        <q-item-separator />
        <q-list-header>Filtering</q-list-header>
        <q-item class="grid-items-2">
          <q-item-main>
            <q-input
              v-model="inputs.filteringInput"
              stack-label="Input"
              placeholder="Filtering input"
              type="number"
            />
          </q-item-main>
          <q-item-main>
            <q-input
              v-model="inputs.filteringDerivative"
              stack-label="Derivative"
              placeholder="Filtering derivative"
              type="number"
            />
          </q-item-main>
        </q-item>
      </q-list>
      <q-card-actions>
        <q-btn
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="save"
        >
          Save
        </q-btn>

        <q-btn
          icon="check"
          :color="kpChanged ? 'primary' : 'light'"
          :disable="!kpChanged"
          @click="updateKP"
        >
          Update KP
        </q-btn>
        <q-btn
          icon="check"
          @click="randomKP"
        >
          Random KP from store
        </q-btn>
      </q-card-actions>

    </widget-modal>

  </div>
</template>

<style scoped>
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
