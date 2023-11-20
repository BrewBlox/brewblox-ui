import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { SPARK_SNIPPET_NAMESPACE } from '@/const';
import { createApi } from '@/database/api';
import { BlockDataSnippet } from '@/plugins/spark/types';
import { concatById, filterById, findById } from '@/utils/collections';

const blockSnippetsApi = createApi<BlockDataSnippet>({
  namespace: SPARK_SNIPPET_NAMESPACE,
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
    blockSnippets.value = await blockSnippetsApi.fetch();
    blockSnippetsApi.subscribe(
      (snippet) => {
        blockSnippets.value = concatById(blockSnippets.value, snippet);
      },
      (id) => {
        blockSnippets.value = filterById(blockSnippets.value, { id });
      },
    );
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
