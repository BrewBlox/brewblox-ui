import { Block, BlockSaveBase, MetricsResult, BlockBase } from './state';

import { get, put, patch } from '@/core/fetch';

export function spreadData(input: any) {
  const spreadInput = {
    ...input.data,
    ...input,
  };

  delete spreadInput.data;

  return spreadInput;
}

export function unspreadData(input: any) {
  const { id, type } = input;
  const data = { ...input };

  // remove id and type from data
  delete data.id;
  delete data.type;

  return {
    // conditionally spread id and type
    ...(id ? { id } : {}),
    ...(type ? { type } : {}),
    // include the data object
    data,
  };
}

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
