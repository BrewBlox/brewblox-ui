import { Block } from '@/services/SparkService/state';

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  };
}
