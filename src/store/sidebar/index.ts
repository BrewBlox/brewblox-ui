import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { makeObjectSorter } from '@/utils/functional';
import api from './api';
import type { SidebarFolder } from './types';

export * from './types';

const sorter = makeObjectSorter<SidebarFolder>('id');

export const useSidebarStore = defineStore('sidebarStore', () => {
  const folderMap = reactive<Mapped<SidebarFolder>>({});

  const folders = computed<SidebarFolder[]>(() =>
    Object.values(folderMap).sort(sorter),
  );

  const folderIds = computed<string[]>(() => folders.value.map((v) => v.id));

  function folderById(id: Maybe<string>): SidebarFolder | null {
    return folderMap[id ?? ''] ?? null;
  }

  function folderTitle(id: Maybe<string>): string {
    return folderById(id)?.title ?? 'Unknown';
  }

  async function createFolder(folder: SidebarFolder): Promise<void> {
    await api.create(folder); // triggers callback
  }

  async function saveFolder(folder: SidebarFolder): Promise<void> {
    await api.persist(folder); // triggers callback
  }

  async function removeFolder(folder: SidebarFolder): Promise<void> {
    await api.remove(folder); // triggers callback
  }

  async function start(): Promise<void> {
    (await api.fetch()).forEach((v) => (folderMap[v.id] = v));
    api.subscribe(
      (folder) => (folderMap[folder.id] = folder),
      (id) => delete folderMap[id],
    );
  }

  return {
    folders,
    folderIds,
    folderById,
    folderTitle,
    createFolder,
    saveFolder,
    removeFolder,
    start,
  };
});
