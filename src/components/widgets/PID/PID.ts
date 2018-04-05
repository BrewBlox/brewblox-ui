import Component from 'vue-class-component';

import { PIDBlock, PIDSettings, PIDLinks, PIDFiltering, PIDState }
  from '../../../store/blocks/PID/PID';

import {
  getAll as getAllSensorSetPointPairs,
} from '../../../store/blocks/SensorSetPointPair/getters';

import BlockWidget from '../BlockWidget';

@Component
export default class PIDWidget extends BlockWidget {
  modalOpen: boolean = false;

  kpInput: number = 0;
  tiInput: number = 0;
  tdInput: number = 0;

  inputLinkInput: string = '';
  outputLinkInput: string = '';

  inputFilteringInput: number = 0;
  derivativeFilteringInput: number = 0;

  mounted() {
    // set default values
    this.kpInput = this.settings.kp;
    this.tiInput = this.settings.ti;
    this.tdInput = this.settings.td;

    this.inputLinkInput = this.links.input;
    this.outputLinkInput = this.links.output;

    this.inputFilteringInput = this.filtering.input;
    this.derivativeFilteringInput = this.filtering.derivative;
  }

  get blockData(): PIDBlock {
    return <PIDBlock>this.block;
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
