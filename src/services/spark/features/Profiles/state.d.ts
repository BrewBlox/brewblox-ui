import { Block } from '@/services/spark/state';

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  };
}
