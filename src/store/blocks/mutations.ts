import { blocks, commit } from './';

export const addBlock = commit(blocks.mutations.addBlock);
export const removeBlock = commit(blocks.mutations.removeBlock);
