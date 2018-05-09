import { flatten } from 'lodash';

import { get, put, patch, post } from '@/core/fetch';
import { spreadData, unspreadData } from '@/core/api-spread';

import { Service } from '@/store/services/state';
import { Block, BlockSaveBase, BlockBase, BlockCreate } from './state';

function addServiceId(block: Block, serviceId: string): Block {
  return {
    ...block,
    serviceId,
  };
}

export function fetchBlocks(services: Service[]): Promise<Block[]> {
  return Promise
    .all(services.map(service =>
      get(`/${encodeURIComponent(service.id)}/objects`)
        .then(blocks => blocks.map((block: Block) => addServiceId(block, service.id)))))
    .then(responses => flatten(responses))
    .then(blocks => blocks.map(spreadData));
}

export function createBlock(block: BlockCreate): Promise<BlockSaveBase> {
  return post(`/${encodeURIComponent(block.serviceId)}/objects`, block);
}

export function persistBlock(block: BlockSaveBase): Promise<BlockSaveBase> {
  return put(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    unspreadData(block),
  ).then(savedBlock => addServiceId(savedBlock, block.serviceId));
}

export function updateBlock(block: BlockBase & any): Promise<BlockSaveBase> {
  return patch(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    unspreadData(block),
  ).then(savedBlock => addServiceId(savedBlock, block.serviceId));
}
