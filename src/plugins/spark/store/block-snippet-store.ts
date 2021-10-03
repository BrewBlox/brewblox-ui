import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { UI_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { BlockDataSnippet } from '@/plugins/spark/types';
import { concatById, filterById, findById } from '@/utils/collections';

const blockSnippetsApi = createApi<BlockDataSnippet>({
  namespace: `${UI_NAMESPACE}:spark-presets`, // retain old namespace to avoid breaking changes
});

export const useBlockSnippetStore = defineStore('blockSnippetStore', () => {
  const blockSnippets = ref<BlockDataSnippet[]>([]);
  const blockSnippetIds = computed<string[]>(() =>
    blockSnippets.value.map((v) => v.id),
  );

  function snippetById(id: string): BlockDataSnippet | null {
    return findById(blockSnippets.value, id);
  }

  async function createSnippet(preset: BlockDataSnippet): Promise<void> {
    await blockSnippetsApi.create(preset); // triggers callback
  }

  async function saveSnippet(preset: BlockDataSnippet): Promise<void> {
    await blockSnippetsApi.persist(preset); // triggers callback
  }

  async function removeSnippet(preset: BlockDataSnippet): Promise<void> {
    await blockSnippetsApi.remove(preset); // triggers callback
  }

  async function start(): Promise<void> {
    const onChange = async (preset: BlockDataSnippet): Promise<void> => {
      blockSnippets.value = concatById(blockSnippets.value, preset);
    };
    const onDelete = (id: string): void => {
      blockSnippets.value = filterById(blockSnippets.value, { id });
    };
    blockSnippets.value = await blockSnippetsApi.fetch();
    blockSnippetsApi.subscribe(onChange, onDelete);
  }

  return {
    blockSnippets,
    blockSnippetIds,
    snippetById,
    createSnippet,
    saveSnippet,
    removeSnippet,
    start,
  };
});
