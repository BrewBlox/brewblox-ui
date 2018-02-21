import { Block } from '../state';

import { get } from './fetch';

export function fetchBlock(id: string): Promise<Block> {
  return get(`/blocks/${id}`);
}
