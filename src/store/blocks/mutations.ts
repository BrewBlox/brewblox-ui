import { blocks, commit } from './index';

export const addBlock = commit(blocks.mutations.addBlock);
export const removeBlock = commit(blocks.mutations.removeBlock);
