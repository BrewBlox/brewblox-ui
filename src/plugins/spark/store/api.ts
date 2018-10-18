import { get, put, post, del } from '@/helpers/fetch';
import { Block, DataBlock, UserUnits, UnitAlternatives } from '../state';

const asDataBlock = (block: Block): DataBlock =>
  ({
    id: block.id,
    type: block.type,
    profiles: block.profiles,
    data: block.data,
  });

const asBlock = (block: DataBlock, serviceId: string): Block => ({ ...block, serviceId });

export const fetchBlocks = async (serviceId: string): Promise<Block[]> =>
  get(`/${encodeURIComponent(serviceId)}/objects`)
    .then(blocks => blocks.map((block: DataBlock) => asBlock(block, serviceId)));

export const fetchBlock = async (block: Block): Promise<Block> =>
  get(`/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`)
    .then(fetched => asBlock(fetched, block.serviceId));

export const createBlock = async (block: Block): Promise<Block> =>
  post(
    `/${encodeURIComponent(block.serviceId)}/objects`,
    asDataBlock(block),
  ).then(savedBlock => asBlock(savedBlock, block.serviceId));

export const persistBlock = async (block: Block): Promise<Block> =>
  put(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  ).then(savedBlock => asBlock(savedBlock, block.serviceId));

export const deleteBlock = async (block: Block): Promise<string> =>
  del(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  ).then(response => response.id);

export const clearBlocks = async (serviceId: string): Promise<any> =>
  del(`/${encodeURIComponent(serviceId)}/objects`, {});

export const fetchUnits = async (serviceId: string): Promise<UserUnits> =>
  get(`/${encodeURIComponent(serviceId)}/codec/units`);

export const persistUnits = async (serviceId: string, units: UserUnits): Promise<UserUnits> =>
  put(`/${encodeURIComponent(serviceId)}/codec/units`, units);

export const fetchUnitAlternatives = async (serviceId: string): Promise<UnitAlternatives> =>
  get(`/${encodeURIComponent(serviceId)}/codec/unit_alternatives`);
