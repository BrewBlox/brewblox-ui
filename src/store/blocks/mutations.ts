import { blocks, commit } from './';

export const commitAddBlock = commit(blocks.mutations.addBlock);
export const commitUpdateBlock = commit(blocks.mutations.updateBlock);
