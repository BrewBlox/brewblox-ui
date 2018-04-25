import { flatten } from 'lodash';

import { get, put, patch } from '@/core/fetch';
import { spreadData, unspreadData } from '@/core/api-spread';

import { Service } from '@/store/services/state';
import { Block, BlockSaveBase, MetricsResult, BlockBase } from './state';

export function fetchBlocks(services: Service[]): Promise<Block[]> {
  return Promise
    .all(services.map(service => get(`/${service.id}/objects`)))
    .then(responses => flatten(responses))
    .then(blocks => blocks.map(spreadData));
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
