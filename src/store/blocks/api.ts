import { flatten } from 'lodash';

import { get, put, patch, post, del } from '@/core/fetch';

import { Service } from '@/store/services/state';
import { Block, DataBlock } from './state';


function asDataBlock(block: Block): DataBlock {
  return {
    id: block.id,
    type: block.type,
    profiles: block.profiles,
    data: block.data,
  };
}


function asBlock(block: DataBlock, serviceId: string): Block {
  return {
    ...block,
    serviceId,
  };
}

export function fetchBlocks(service: Service): Promise<Block[]> {
  return get(`/${encodeURIComponent(service.id)}/objects`)
    .then(blocks => blocks.map((block: DataBlock) => asBlock(block, service.id)));
}

export function createBlock(block: Block): Promise<Block> {
  return post(
    `/${encodeURIComponent(block.serviceId)}/objects`,
    asDataBlock(block),
  ).then(savedBlock => asBlock(savedBlock, block.serviceId));
}

export function persistBlock(block: Block): Promise<Block> {
  return put(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  ).then(savedBlock => asBlock(savedBlock, block.serviceId));
}

export function deleteBlock(block: Block): Promise<string> {
  return del(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  ).then(response => response.id);
}

export function clearBlocks(serviceId: string): Promise<any> {
  return del(`/${encodeURIComponent(serviceId)}/objects`, {});
}
