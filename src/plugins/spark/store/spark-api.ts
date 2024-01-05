import { AxiosResponse } from 'axios';
import { Block, SparkStatusDescription } from 'brewblox-proto/ts';
import { BlockIds, BlockPatchArgs, SparkBackup } from '@/plugins/spark/types';
import { http, intercept } from '@/utils/http';
import { notify } from '@/utils/notify';

export const fetchBlocks = (serviceId: string): Promise<Block[]> =>
  http
    .post<Block[]>(`/${encodeURIComponent(serviceId)}/blocks/all/read`)
    .then((resp) => resp.data.map((block: Block) => block, serviceId))
    .catch(intercept(`Failed to fetch blocks from ${serviceId}`));

export const fetchBlock = ({ id, serviceId }: Block): Promise<Block> =>
  http
    .post<BlockIds, AxiosResponse<Block>>(
      `/${encodeURIComponent(serviceId)}/blocks/read`,
      { id },
    )
    .then((resp) => resp.data)
    .catch(intercept(`Failed to fetch ${id}`));

export const fetchStoredBlock = (
  serviceId: string,
  nid: number,
): Promise<Block> =>
  http
    .post<BlockIds, AxiosResponse<Block>>(
      `/${encodeURIComponent(serviceId)}/blocks/read/stored`,
      {
        nid,
      },
    )
    .then((resp) => resp.data)
    .catch(intercept(`Failed to fetch stored block ${nid}`));

export const createBlock = (block: Block): Promise<Block> =>
  http
    .post<Block>(`/${encodeURIComponent(block.serviceId)}/blocks/create`, block)
    .then((resp) => resp.data)
    .catch(intercept(`Failed to create ${block.id}`));

export const persistBlock = (block: Block): Promise<Block> =>
  http
    .post<Block>(`/${encodeURIComponent(block.serviceId)}/blocks/write`, block)
    .then((resp) => resp.data)
    .catch(intercept(`Failed to persist ${block.id}`));

export const patchBlock = <T extends Block>(
  block: BlockPatchArgs<T>[0],
  data: BlockPatchArgs<T>[1],
): Promise<T> =>
  http
    .post<T>(`/${encodeURIComponent(block.serviceId)}/blocks/patch`, {
      ...block,
      data,
    })
    .then((resp) => resp.data)
    .catch(intercept(`Failed to patch ${block.id}`));

export const renameBlock = (
  serviceId: string,
  existing: string,
  desired: string,
): Promise<any> =>
  http
    .post(`/${encodeURIComponent(serviceId)}/blocks/rename`, {
      existing,
      desired,
    })
    .catch(intercept(`Failed to rename ${existing}`));

export const deleteBlock = ({ serviceId, id }: Block): Promise<string> =>
  http
    .post<BlockIds>(`/${encodeURIComponent(serviceId)}/blocks/delete`, { id })
    .then((resp) => resp.data.id!)
    .catch(intercept(`Failed to delete ${id}`));

export async function batchCreateBlocks(blocks: Block[]): Promise<Block[]> {
  if (!blocks.length) {
    return [];
  }
  const { serviceId } = blocks[0];
  return http
    .post<Block[]>(
      `/${encodeURIComponent(serviceId)}/blocks/batch/create`,
      blocks,
    )
    .then((resp) => resp.data)
    .catch(intercept('Failed to batch create blocks'));
}

export async function batchPersistBlocks(blocks: Block[]): Promise<Block[]> {
  if (!blocks.length) {
    return [];
  }
  const { serviceId } = blocks[0];
  return http
    .post<Block[]>(
      `/${encodeURIComponent(serviceId)}/blocks/batch/write`,
      blocks,
    )
    .then((resp) => resp.data)
    .catch(intercept('Failed to batch write blocks'));
}

export async function batchPatchBlocks(
  args: BlockPatchArgs<Block>[],
): Promise<Block[]> {
  if (!args.length) {
    return [];
  }
  const { serviceId } = args[0][0];
  const blocks = args.map(([block, data]) => ({ ...block, data }));
  return http
    .post<Block[]>(
      `/${encodeURIComponent(serviceId)}/blocks/batch/patch`,
      blocks,
    )
    .then((resp) => resp.data)
    .catch(intercept('Failed to batch patch blocks'));
}

export async function batchDeleteBlocks(blocks: Block[]): Promise<string[]> {
  if (!blocks.length) {
    return [];
  }
  const { serviceId } = blocks[0];
  return http
    .post<BlockIds[]>(
      `/${encodeURIComponent(serviceId)}/blocks/delete`,
      blocks.map((v) => ({ id: v.id })),
    )
    .then((resp) => resp.data.map((v) => v.id!))
    .catch(intercept('Failed to batch delete blocks'));
}

export const clearBlocks = (serviceId: string): Promise<any> =>
  http
    .post(`/${encodeURIComponent(serviceId)}/blocks/all/delete`)
    .catch(intercept(`Failed to clear blocks on ${serviceId}`));

export const cleanUnusedNames = (serviceId: string): Promise<string[]> =>
  http
    .post<BlockIds[]>(`/${encodeURIComponent(serviceId)}/blocks/cleanup`)
    .then((resp) => resp.data.map((v) => v.id!))
    .catch(intercept(`Failed to clean unused block names on ${serviceId}`));

export const fetchDiscoveredBlocks = (serviceId: string): Promise<Block[]> =>
  http
    .post<Block[]>(`/${encodeURIComponent(serviceId)}/blocks/discover`)
    .then((resp) => resp.data)
    .catch(intercept(`Failed to discover objects on ${serviceId}`));

export const validateService = (serviceId: string): Promise<boolean> =>
  http
    .get<SparkStatusDescription>(
      `/${encodeURIComponent(serviceId)}/system/status`,
    )
    .then((resp) => resp.data.service != null)
    .catch(() => false);

export const persistEnabled = (
  serviceId: string,
  enabled: boolean,
): Promise<boolean> =>
  http
    .put<{ enabled: boolean }>(
      `/${encodeURIComponent(serviceId)}/settings/enabled`,
      { enabled },
    )
    .then((resp) => resp.data.enabled)
    .catch(intercept(`Failed to persist enabled flag on ${serviceId}`));

export const fetchSparkStatus = async (
  serviceId: string,
): Promise<SparkStatusDescription | null> => {
  try {
    const resp = await http.get<SparkStatusDescription>(
      `/${encodeURIComponent(serviceId)}/system/status`,
      { timeout: 5 * 1000 },
    );
    return resp.data;
  } catch (error) {
    notify.warn(`Unable to fetch Spark status: ${error}`, { shown: false });
    return null;
  }
};

export const flashFirmware = (serviceId: string): Promise<any> =>
  http
    .post(`/${encodeURIComponent(serviceId)}/system/flash`, {})
    .then((resp) => resp.data)
    .catch(intercept(`Failed to update firmware on ${serviceId}`));

export const serviceExport = (serviceId: string): Promise<SparkBackup> =>
  http
    .post<SparkBackup>(`/${encodeURIComponent(serviceId)}/blocks/backup/save`)
    .then((resp) => resp.data)
    .catch(intercept(`Failed to fetch export blocks from ${serviceId}`));

export const serviceImport = (
  serviceId: string,
  exported: SparkBackup,
): Promise<string[]> =>
  http
    .post<SparkBackup, AxiosResponse<{ messages: string[] }>>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/load`,
      exported,
    )
    .then((resp) => resp.data.messages)
    .catch(intercept(`Failed to import blocks in ${serviceId}`));

export const allStoredBackup = (serviceId: string): Promise<string[]> =>
  http
    .post<{ name: string }[]>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/stored/all`,
      {},
    )
    .then((resp) => resp.data.map((v) => v.name))
    .catch(intercept(`Failed to list all backups in ${serviceId}`));

export const saveStoredBackup = (
  serviceId: string,
  name: string,
): Promise<SparkBackup> =>
  http
    .post<{ name: string }, AxiosResponse<SparkBackup>>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/stored/save`,
      { name },
    )
    .then((resp) => resp.data)
    .catch(intercept(`Failed to save Spark backup ${name} in ${serviceId}`));

export const loadStoredBackup = (
  serviceId: string,
  name: string,
): Promise<string[]> =>
  http
    .post<{ name: string }, AxiosResponse<{ messages: string[] }>>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/stored/load`,
      { name },
    )
    .then((resp) => resp.data.messages)
    .catch(intercept(`Failed to load Spark backup ${name} in ${serviceId}`));

export const uploadStoredBackup = (
  serviceId: string,
  data: SparkBackup,
): Promise<SparkBackup> =>
  http
    .post<SparkBackup, AxiosResponse<SparkBackup>>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/stored/upload`,
      data,
    )
    .then((resp) => resp.data)
    .catch(intercept(`Failed to upload Spark backup in ${serviceId}`));

export const downloadStoredBackup = (
  serviceId: string,
  name: string,
): Promise<SparkBackup> =>
  http
    .post<{ name: string }, AxiosResponse<SparkBackup>>(
      `/${encodeURIComponent(serviceId)}/blocks/backup/stored/download`,
      { name },
    )
    .then((resp) => resp.data)
    .catch(
      intercept(`Failed to download Spark backup ${name} in ${serviceId}`),
    );

export const serviceReboot = (serviceId: string): Promise<any> =>
  http
    .post(`/${encodeURIComponent(serviceId)}/system/reboot/service`, {})
    .then((resp) => resp.data)
    .catch(intercept(`Failed to reboot ${serviceId}`));

export const controllerReboot = (serviceId: string): Promise<any> =>
  http
    .post(`/${encodeURIComponent(serviceId)}/system/reboot/controller`, {})
    .then((resp) => resp.data)
    .catch(intercept(`Failed to reboot ${serviceId}`));
