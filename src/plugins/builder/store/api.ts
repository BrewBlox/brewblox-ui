import { create, fetchAll, fetchById, persist, registerModule, remove } from '@/helpers/database';

import { BuilderLayout } from '../types';

const LAYOUT = 'layout';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    registerModule({ onChanged, onDeleted, id: LAYOUT });

export const fetchLayouts = async (): Promise<BuilderLayout[]> =>
  fetchAll(LAYOUT);

export const fetchLayoutById = async (id: string): Promise<BuilderLayout> =>
  fetchById(LAYOUT, id);

export const createLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  create(LAYOUT, layout);

export const persistLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  persist(LAYOUT, layout);

export const deleteLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  remove(LAYOUT, layout);
