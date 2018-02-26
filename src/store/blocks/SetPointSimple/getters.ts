import { Block } from '../state';

import { blockById } from '../getters';

export const getById = (id: string): Block => blockById(id);
