import { defineStore } from 'pinia';

import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { BlockDataSnippet } from '@/plugins/spark/types';
import { concatById, filterById, findById } from '@/utils/collections';

const blockSnippetsApi = createApi<BlockDataSnippet>({
  namespace: `${UI_NAMESPACE}:spark-presets`, // retain old namespace to avoid breaking changes
});

interface BlockSnippetStoreState {
  blockSnippets: BlockDataSnippet[];
}

export const useBlockSnippetStore = defineStore('blockSnippetStore', {
  state: (): BlockSnippetStoreState => ({
    blockSnippets: [],
  }),
  getters: {
    blockSnippetIds: (state): string[] => state.blockSnippets.map((v) => v.id),
  },
  actions: {
    snippetById(id: string): BlockDataSnippet | null {
      return findById(this.blockSnippets, id);
    },

    async createSnippet(preset: BlockDataSnippet): Promise<void> {
      await blockSnippetsApi.create(preset); // triggers callback
    },

    async saveSnippet(preset: BlockDataSnippet): Promise<void> {
      await blockSnippetsApi.persist(preset); // triggers callback
    },

    async removeSnippet(preset: BlockDataSnippet): Promise<void> {
      await blockSnippetsApi.remove(preset); // triggers callback
    },

    async start(): Promise<void> {
      const onChange = async (preset: BlockDataSnippet): Promise<void> => {
        this.blockSnippets = concatById(this.blockSnippets, preset);
      };
      const onDelete = (id: string): void => {
        this.blockSnippets = filterById(this.blockSnippets, { id });
      };
      this.blockSnippets = await blockSnippetsApi.fetch();
      blockSnippetsApi.subscribe(onChange, onDelete);
    },
  },
});
