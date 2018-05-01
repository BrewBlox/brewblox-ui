import Component, { mixins } from 'vue-class-component';

import { PIDBlock, PIDSettings, PIDLinks, PIDFiltering, PIDState }
  from '@/store/blocks/PID/PID';

import { getAll as getAllSensorSetPointPairs } from '@/store/blocks/SensorSetPointPair/getters';
import { refresh, persist, update } from '@/store/blocks/PID/actions';

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

  get blockData(): PIDBlock {
    return this.block as PIDBlock;
  }

  get settings(): PIDSettings {
    return this.blockData.settings;
  }

  get links(): PIDLinks {
    return this.blockData.links;
  }

  get filtering(): PIDFiltering {
    return this.blockData.filtering;
  }

  get state(): PIDState {
    return this.blockData.state;
  }

  get allSensorSetPointPairs(): { label: string, value: string }[] {
    return getAllSensorSetPointPairs(this.$store, this.blockData.serviceId)
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
    refresh(this.$store, this.blockData);
  }

  updateKP() {
    update(this.$store, {
      id: this.block.id,
      serviceId: this.block.serviceId,
      settings: {
        kp: this.inputs.kpInput,
      },
    });
  }

  randomKP() {
    update(this.$store, {
      id: this.block.id,
      serviceId: this.block.serviceId,
      settings: {
        kp: Math.round(Math.random() * 15),
      },
    });
  }

  save() {
    persist(this.$store, {
      id: this.block.id,
      serviceId: this.block.serviceId,
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
    });
  }
}
