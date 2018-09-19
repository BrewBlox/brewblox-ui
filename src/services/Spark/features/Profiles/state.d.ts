import { Block } from '@/services/Spark/state';

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  };
}
