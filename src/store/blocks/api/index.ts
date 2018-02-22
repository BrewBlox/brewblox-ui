import { Block } from '../state';

import { get } from './fetch';

export function fetchBlock(id: string): Promise<Block> {
  return get(`/blocks/${id}`);
}

export function fetchBlocks(): Promise<Block[]> {
  return get('/blocks/list');
}
