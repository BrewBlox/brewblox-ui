import api from './api';
import type { SidebarFolder } from './types';
import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';

export * from './types';

interface SidebarStoreState {
  folders: SidebarFolder[];
}

export const useSidebarStore = defineStore('sidebarStore', {
  state: (): SidebarStoreState => ({
    folders: [],
  }),
  getters: {
    folderIds: (state): string[] => state.folders.map((v) => v.id),
  },
  actions: {
    folderById(id: Maybe<string>): SidebarFolder | null {
      return findById(this.folders, id);
    },

    folderTitle(id: Maybe<string>): string {
      return this.folderById(id)?.title ?? 'Unknown';
    },

    async createFolder(folder: SidebarFolder): Promise<void> {
      await api.create(folder); // triggers callback
    },

    async saveFolder(folder: SidebarFolder): Promise<void> {
      await api.persist(folder); // triggers callback
    },

    async removeFolder(folder: SidebarFolder): Promise<void> {
      await api.remove(folder); // triggers callback
    },

    async start(): Promise<void> {
      this.folders = await api.fetch();
      api.subscribe(
        (folder) => (this.folders = concatById(this.folders, folder)),
        (id) => (this.folders = filterById(this.folders, { id })),
      );
    },
  },
});
