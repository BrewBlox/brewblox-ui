import Component, { mixins } from 'vue-class-component';

import { PidBlock, PIDSettings, PIDLinks, PIDFiltering, PIDState }
  from '@/store/blocks/PID/PID';

import { getById } from '@/store/blocks/PID/getters';
import { getAll as getAllSensorSetPointPairs } from '@/store/blocks/SensorSetPointPair/getters';
import { refresh } from '@/store/blocks/PID/actions';
import { saveBlock } from '@/store/blocks/actions';
import { updateBlockState } from '@/store/blocks/mutations';

import BlockWidget from '../BlockWidget';

@Component
export default class PIDWidget extends mixins(BlockWidget) {
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
    return getById(this.$store, this.options.block);
  }

  get settings(): PIDSettings {
    return this.block.data.settings;
  }

  get links(): PIDLinks {
    return this.block.data.links;
  }

  get filtering(): PIDFiltering {
    return this.block.data.filtering;
  }

  get state(): PIDState {
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
    updateBlockState(this.$store, {
      id: this.block.id,
      serviceId: this.block.serviceId,
      data: {
        settings: {
          kp: this.inputs.kp,
        },
      },
    });
  }

  randomKP() {
    updateBlockState(this.$store, {
      id: this.block.id,
      serviceId: this.block.serviceId,
      data: {
        settings: {
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
