import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';
import api from './api';
import type { SidebarDirectory } from './types';

export * from './types';

interface SidebarStoreState {
  directories: SidebarDirectory[];
}

export const useSidebarStore = defineStore('sidebarStore', {
  state: (): SidebarStoreState => ({
    directories: [],
  }),
  getters: {
    directoryIds: (state): string[] => state.directories.map((v) => v.id),
  },
  actions: {
    directoryById(id: Maybe<string>): SidebarDirectory | null {
      return findById(this.directories, id);
    },

    directoryTitle(id: Maybe<string>): string {
      return this.directoryById(id)?.title ?? 'Unknown';
    },

    async createDirectory(directory: SidebarDirectory): Promise<void> {
      await api.create(directory); // triggers callback
    },

    async saveDirectory(directory: SidebarDirectory): Promise<void> {
      await api.persist(directory); // triggers callback
    },

    async removeDirectory(directory: SidebarDirectory): Promise<void> {
      await api.remove(directory); // triggers callback
    },

    async start(): Promise<void> {
      this.directories = await api.fetch();
      api.subscribe(
        (directory) =>
          (this.directories = concatById(this.directories, directory)),
        (id) => (this.directories = filterById(this.directories, { id })),
      );
    },
  },
});
