import { Block } from '../state';

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  }
}
