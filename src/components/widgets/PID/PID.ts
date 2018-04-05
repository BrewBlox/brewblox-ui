import Component from 'vue-class-component';

import { PIDBlock, PIDSettings, PIDLinks, PIDState } from '../../../store/blocks/PID/PID';

import {
  getAll as getAllSensorSetPointPairs,
} from '../../../store/blocks/SensorSetPointPair/getters';

import BlockWidget from '../BlockWidget';

@Component
export default class PIDWidget extends BlockWidget {
  modalOpen: boolean = true;

  kpInput: number = 0;
  tiInput: number = 0;
  tdInput: number = 0;

  inputLinkInput: string = '';
  outputLinkInput: string = '';

  mounted() {
    // set default values
    this.kpInput = this.settings.kp;
    this.tiInput = this.settings.ti;
    this.tdInput = this.settings.td;

    this.inputLinkInput = this.links.input;
    this.outputLinkInput = this.links.output;
  }

  get settings(): PIDSettings {
    const block = <PIDBlock>this.block;

    return block.settings;
  }

  get links(): PIDLinks {
    const block = <PIDBlock>this.block;

    return block.links;
  }

  get state(): PIDState {
    const block = <PIDBlock>this.block;

    return block.state;
  }

  get allSensorSetPointPairs(): { label: string, value: string }[] {
    return getAllSensorSetPointPairs(this.$store)
      .map(setpoint => ({ label: setpoint.id, value: setpoint.id }));
  }

  closeModal() {
    this.modalOpen = false;
  }

  openModal() {
    this.modalOpen = true;
  }
}
