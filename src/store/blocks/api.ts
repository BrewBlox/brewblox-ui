import { Block, BlockSaveBase, MetricsResult } from './state';

import { get, put } from '@/core/fetch';

export function fetchBlock(id: string): Promise<Block> {
  return get(`/blocks/${encodeURIComponent(id)}`);
}

export function fetchBlocks(): Promise<Block[]> {
  return get('/blocks/list');
}

export function persistBlock(block: BlockSaveBase): Promise<BlockSaveBase> {
  return put(`/blocks/${encodeURIComponent(block.id)}`, block);
}

export function fetchBlockMetrics(id: string): Promise<MetricsResult> {
  return get(`/blocks/${encodeURIComponent(id)}/metrics`);
}
