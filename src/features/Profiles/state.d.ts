import { Block } from '@/store/blocks/state';

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  };
}
