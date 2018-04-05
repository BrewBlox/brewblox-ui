import Component from 'vue-class-component';

import { PIDBlock, PIDState } from '../../../store/blocks/PID/PID';

import BlockWidget from '../BlockWidget';

@Component
export default class PIDWidget extends BlockWidget {
  modalOpen: boolean = false;

  get state(): PIDState {
    const block = <PIDBlock>this.block;

    return block.state;
  }

  openModal() {
    this.modalOpen = true;
  }
}
