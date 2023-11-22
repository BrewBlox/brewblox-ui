import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { concatById, filterById, findById } from '@/utils/collections';
import api from './api';
import type { SidebarFolder } from './types';

export * from './types';

export const useSidebarStore = defineStore('sidebarStore', () => {
  const folders = ref<SidebarFolder[]>([]);

  const folderIds = computed<string[]>(() => folders.value.map((v) => v.id));

  function folderById(id: Maybe<string>): SidebarFolder | null {
    return findById(folders.value, id);
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
    folders.value = await api.fetch();
    api.subscribe(
      (folder) => (folders.value = concatById(folders.value, folder)),
      (id) => (folders.value = filterById(folders.value, { id })),
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
