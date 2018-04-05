import { blockById } from '../../store/blocks/getters';
import { Block } from '../../store/blocks/state';

import Widget from './Widget';

class BlockWidget extends Widget {
  get block(): Block {
    return blockById(this.$store, this.options.block);
  }
}

export default BlockWidget;
