import { Notify } from 'quasar';
import queryString from 'query-string';
import { del, get, post, put, sse } from '@/helpers/fetch';
import { deserialize } from '@/helpers/units/parseObject';
import { Block, DataBlock, UnitAlternatives, UserUnits, SystemStatus } from '../state';


const asDataBlock = (block: Block): DataBlock =>
  ({
    id: block.id,
    type: block.type,
    groups: block.groups,
    data: block.data,
  });

const asBlock = (block: DataBlock, serviceId: string): Block => ({ ...block, serviceId });

const intercept = (message: string) => (e: Error) => {
  Notify.create(`${message}: ${e.message}`);
  throw e;
};

export const fetchBlocks = async (serviceId: string): Promise<Block[]> =>
  get(`/${encodeURIComponent(serviceId)}/objects`)
    .then(blocks => blocks.map((block: DataBlock) => asBlock(block, serviceId)))
    .catch(intercept(`Failed to fetch blocks from ${serviceId}`));

export const fetchBlock = async (block: Block): Promise<Block> =>
  get(`/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`)
    .then(fetched => asBlock(fetched, block.serviceId))
    .catch(intercept(`Failed to fetch ${block.id}`));

export const createBlock = async (block: Block): Promise<Block> =>
  post(
    `/${encodeURIComponent(block.serviceId)}/objects`,
    asDataBlock(block),
  )
    .then(savedBlock => asBlock(savedBlock, block.serviceId))
    .catch(intercept(`Failed to create ${block.id}`));

export const persistBlock = async (block: Block): Promise<Block> =>
  put(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(savedBlock => asBlock(savedBlock, block.serviceId))
    .catch(intercept(`Failed to persist ${block.id}`));

export const renameBlock = async (serviceId: string, currentId: string, newId: string) =>
  put(
    `/${encodeURIComponent(serviceId)}/aliases/${encodeURIComponent(currentId)}`,
    { id: newId },
  )
    .catch(intercept(`Failed to rename ${currentId}`));

export const deleteBlock = async (block: Block): Promise<string> =>
  del(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(response => response.id)
    .catch(intercept(`Failed to delete ${block.id}`));

export const clearBlocks = async (serviceId: string): Promise<any> =>
  del(`/${encodeURIComponent(serviceId)}/objects`, {})
    .catch(intercept(`Failed to clear blocks on ${serviceId}`));

export const fetchUnits = async (serviceId: string): Promise<UserUnits> =>
  get(`/${encodeURIComponent(serviceId)}/codec/units`)
    .catch(intercept(`Failed to fetch unit settings on ${serviceId}`));

export const persistUnits = async (serviceId: string, units: UserUnits): Promise<UserUnits> =>
  put(`/${encodeURIComponent(serviceId)}/codec/units`, units)
    .catch(intercept(`Failed to persist unit settings on ${serviceId}`));

export const fetchUnitAlternatives = async (serviceId: string): Promise<UnitAlternatives> =>
  get(`/${encodeURIComponent(serviceId)}/codec/unit_alternatives`)
    .catch(intercept(`Failed to fetch unit alternatives on ${serviceId}`));

export const fetchCompatibleBlocks = async (serviceId: string, type: string, ): Promise<string[]> =>
  get(`/${encodeURIComponent(serviceId)}/compatible_objects?${queryString.stringify({ interface: type })}`)
    .catch(intercept(`Failed to fetch blocks compatible to ${type}`));


export const fetchDiscoveredBlocks = async (serviceId: string): Promise<string[]> =>
  get(`/${encodeURIComponent(serviceId)}/discover_objects`)
    .catch(intercept(`Failed to discover objects on ${serviceId}`));

export const fetchSavepoints = async (serviceId: string): Promise<string[]> =>
  get(`/${encodeURIComponent(serviceId)}/savepoints`)
    .catch(intercept(`Failed to fetch savepoints on ${serviceId}`));

export const writeSavepoint = async (serviceId: string, savepointId: string): Promise<string[]> =>
  put(`/${encodeURIComponent(serviceId)}/savepoints/${encodeURIComponent(savepointId)}`, {})
    .catch(intercept(`Failed to write savepoint ${savepointId}`));

export const applySavepoint = async (serviceId: string, savepointId: string): Promise<string[]> =>
  post(`/${encodeURIComponent(serviceId)}/savepoints/${encodeURIComponent(savepointId)}`, {})
    .catch(intercept(`Failed to apply savepoint ${savepointId}`));

export const removeSavepoint = async (serviceId: string, savepointId: string): Promise<string[]> =>
  del(`/${encodeURIComponent(serviceId)}/savepoints/${encodeURIComponent(savepointId)}`, {})
    .catch(intercept(`Failed to remove savepoint ${savepointId}`));

export const validateService = async (serviceId: string): Promise<boolean> =>
  get(`/${encodeURIComponent(serviceId)}/_service/status`)
    .then(retv => retv.status === 'ok')
    .catch(() => false);

export const fetchUpdateSource = async (
  serviceId: string,
  onData: (blocks: Block[]) => void,
  onClose: () => void,
) => {
  const source = await sse(`/${encodeURIComponent(serviceId)}/sse/objects`);
  source.onerror = () => {
    source.close();
    onClose();
  };
  source.onmessage = (event: MessageEvent) =>
    onData(deserialize(JSON.parse(event.data))
      .map(((block: DataBlock) => asBlock(block, serviceId))));

  return source;
};

export const fetchSystemStatus = async (serviceId: string): Promise<SystemStatus> =>
  get(`/${encodeURIComponent(serviceId)}/system/status`)
    .then(retv => ({
      ...retv,
      available: true,
      checkedAt: new Date(),
    }))
    .catch((error) => ({
      error,
      available: false,
      connected: false,
      synchronized: false,
      checkedAt: new Date(),
    }));
