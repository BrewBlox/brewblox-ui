import { get, put, patch } from '@/core/fetch';
import { spreadData, unspreadData } from '@/core/api-spread';

import { Block, BlockSaveBase, MetricsResult, BlockBase } from './state';

export function fetchBlock(id: string): Promise<Block> {
  return get(`/blocks/${encodeURIComponent(id)}`).then(block => spreadData(block));
}

export function fetchBlocks(): Promise<Block[]> {
  return get('/blocks/list').then(blocks => blocks.map(spreadData));
}

export function fetchBlockMetrics(id: string): Promise<MetricsResult> {
  return get(`/blocks/${encodeURIComponent(id)}/metrics`);
}

export function persistBlock(block: BlockSaveBase): Promise<BlockSaveBase> {
  return put(`/blocks/${encodeURIComponent(block.id)}`, unspreadData(block));
}

export function updateBlock(block: BlockBase & any): Promise<BlockSaveBase> {
  return patch(`/blocks/${encodeURIComponent(block.id)}`, unspreadData(block));
}
