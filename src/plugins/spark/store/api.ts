
import http, { intercept } from '@/helpers/http';
import notify from '@/helpers/notify';

import { asBlock, asDataBlock } from '../helpers';
import { Block } from '../types';
import { ApiSparkStatus, DataBlock, SparkExported, SparkStatus, UserUnits } from '../types';

export const fetchBlocks = (serviceId: string): Promise<Block[]> =>
  http.get<DataBlock[]>(`/${encodeURIComponent(serviceId)}/objects`)
    .then(resp => resp.data.map((block: DataBlock) => asBlock(block, serviceId)))
    .catch(intercept(`Failed to fetch blocks from ${serviceId}`));

export const fetchBlock = (block: Block): Promise<Block> =>
  http.get<DataBlock>(`/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`)
    .then(resp => asBlock(resp.data, block.serviceId))
    .catch(intercept(`Failed to fetch ${block.id}`));

export const fetchStoredBlock = (serviceId: string, id: string | number): Promise<Block> =>
  http.get<DataBlock>(`/${encodeURIComponent(serviceId)}/stored_objects/${encodeURIComponent(id)}`)
    .then(resp => asBlock(resp.data, serviceId))
    .catch(intercept(`Failed to fetch stored block ${id}`));

export const createBlock = (block: Block): Promise<Block> =>
  http.post<DataBlock>(
    `/${encodeURIComponent(block.serviceId)}/objects`,
    asDataBlock(block),
  )
    .then(resp => asBlock(resp.data, block.serviceId))
    .catch(intercept(`Failed to create ${block.id}`));

export const persistBlock = (block: Block): Promise<Block> =>
  http.put<DataBlock>(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(resp => asBlock(resp.data, block.serviceId))
    .catch(intercept(`Failed to persist ${block.id}`));

export const renameBlock = (serviceId: string, currentId: string, newId: string): Promise<any> =>
  http.put(
    `/${encodeURIComponent(serviceId)}/aliases/${encodeURIComponent(currentId)}`,
    { id: newId },
  )
    .catch(intercept(`Failed to rename ${currentId}`));

export const deleteBlock = (block: Block): Promise<string> =>
  http.delete<DataBlock>(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(resp => resp.data.id)
    .catch(intercept(`Failed to delete ${block.id}`));

export const clearBlocks = (serviceId: string): Promise<any> =>
  http.delete(`/${encodeURIComponent(serviceId)}/objects`, {})
    .catch(intercept(`Failed to clear blocks on ${serviceId}`));

export const cleanUnusedNames = (serviceId: string): Promise<string[]> =>
  http.delete<string[]>(`/${encodeURIComponent(serviceId)}/unused_names`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to clean unused block names on ${serviceId}`));

export const fetchUnits = (serviceId: string): Promise<UserUnits> =>
  http.get<UserUnits>(`/${encodeURIComponent(serviceId)}/settings/units`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch unit settings on ${serviceId}`));

export const persistUnits = (serviceId: string, units: UserUnits): Promise<UserUnits> =>
  http.put<UserUnits>(`/${encodeURIComponent(serviceId)}/settings/units`, units)
    .then(resp => resp.data)
    .catch(intercept(`Failed to persist unit settings on ${serviceId}`));

export const persistAutoconnecting = (serviceId: string, enabled: boolean): Promise<boolean> =>
  http.put<{ enabled: boolean }>(`/${encodeURIComponent(serviceId)}/settings/autoconnecting`, { enabled })
    .then(resp => resp.data.enabled)
    .catch(intercept(`Failed to persist autoconnecting flag on ${serviceId}`));

export const fetchDiscoveredBlocks = (serviceId: string): Promise<HasId[]> =>
  http.get<HasId[]>(`/${encodeURIComponent(serviceId)}/discover_objects`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to discover objects on ${serviceId}`));

export const validateService = (serviceId: string): Promise<boolean> =>
  http.get(`/${encodeURIComponent(serviceId)}/_service/status`)
    .then(resp => resp.data.status === 'ok')
    .catch(() => false);

const unknownStatus = (): ApiSparkStatus => ({
  autoconnecting: true,
  connect: false,
  handshake: false,
  synchronize: false,
  compatible: true, // no idea - assume yes
  latest: true, // no idea - assume yes
  valid: true, // no idea - assume yes
  info: [],
  address: null,
  connection: null,
});

export const fetchSparkStatus = async (serviceId: string): Promise<SparkStatus> => {
  try {
    const resp = await http.get<ApiSparkStatus>(`/${encodeURIComponent(serviceId)}/system/status`);
    return {
      ...resp.data,
      serviceId,
      available: true,
    };
  } catch (error) {
    notify.warn(`Unable to fetch Spark status: ${error}`, { shown: false });
    return {
      ...unknownStatus(),
      serviceId,
      available: false,
    };
  }
};

export const flashFirmware = (serviceId: string): Promise<any> =>
  http.post(`/${encodeURIComponent(serviceId)}/system/flash`, {})
    .then(resp => resp.data)
    .catch(intercept(`Failed to update firmware on ${serviceId}`));

export const serviceExport = (serviceId: string): Promise<SparkExported> =>
  http.get<SparkExported>(`/${encodeURIComponent(serviceId)}/export_objects`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch stored blocks from ${serviceId}`));

export const serviceImport = (serviceId: string, exported: SparkExported): Promise<string[]> =>
  http.post<string[]>(`/${encodeURIComponent(serviceId)}/import_objects`, exported)
    .then(resp => resp.data)
    .catch(intercept(`Failed to reset stored blocks in ${serviceId}`));

export const reboot = (serviceId: string): Promise<any> =>
  http.get(`/${encodeURIComponent(serviceId)}/system/reboot`, {})
    .then(resp => resp.data)
    .catch(intercept(`Failed to reboot ${serviceId}`));
