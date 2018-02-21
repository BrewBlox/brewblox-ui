import { blocks, commit } from './';

export const commitAddBlock = commit(blocks.mutations.addBlock);
export const commitRemoveBlock = commit(blocks.mutations.removeBlock);
