import { get, put, patch } from '@/core/fetch';
import { spreadData, unspreadData } from '@/core/api-spread';

import { Block, BlockSaveBase, MetricsResult, BlockBase } from './state';

export function fetchBlocks(): Promise<Block[]> {
  return get('/objects').then(blocks => blocks.map(spreadData));
}

export function fetchBlock(id: string): Promise<Block> {
  return get(`/objects/${encodeURIComponent(id)}`).then(block => spreadData(block));
}

export function fetchBlockMetrics(id: string): Promise<MetricsResult> {
  return get(`/objects/${encodeURIComponent(id)}/metrics`);
}

export function persistBlock(block: BlockSaveBase): Promise<BlockSaveBase> {
  return put(`/objects/${encodeURIComponent(block.id)}`, unspreadData(block));
}

export function updateBlock(block: BlockBase & any): Promise<BlockSaveBase> {
  return patch(`/objects/${encodeURIComponent(block.id)}`, unspreadData(block));
}
