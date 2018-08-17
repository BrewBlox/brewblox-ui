import Vue from 'vue';

import { Block } from '@/store/blocks/state';

export default abstract class BlockComponent extends Vue {
  abstract get block(): Block;
  abstract get changed(): boolean;

  get id(): string {
    return this.block.id;
  }

  get type(): string {
    return this.block.type;
  }

  get profiles(): number[] {
    return this.block.profiles;
  }

  get serviceId(): string {
    return this.block.serviceId;
  }

  get loading(): boolean {
    return Boolean(this.block.isLoading);
  }
}
