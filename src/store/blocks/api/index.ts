import { Block, BlockUpdateBase } from '../state';

import { get, post } from './fetch';

export function fetchBlock(id: string): Promise<Block> {
  return get(`/blocks/${id}`);
}

export function fetchBlocks(): Promise<Block[]> {
  return get('/blocks/list');
}

export function persistBlock(block: BlockUpdateBase): Promise<BlockUpdateBase> {
  return post(`/blocks/${block.id}`, block);
}
