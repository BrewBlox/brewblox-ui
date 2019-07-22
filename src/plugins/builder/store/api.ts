import { create, fetchAll, fetchById, persist, registerModule, remove } from '@/helpers/database';

import { BuilderLayout } from '../types';

const LAYOUTS = 'layouts';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    registerModule({ onChanged, onDeleted, id: LAYOUTS });

export const fetchLayouts = async (): Promise<BuilderLayout[]> =>
  fetchAll(LAYOUTS);

export const fetchLayoutById = async (id: string): Promise<BuilderLayout> =>
  fetchById(LAYOUTS, id);

export const createLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  create(LAYOUTS, layout);

export const persistLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  persist(LAYOUTS, layout);

export const deleteLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  remove(LAYOUTS, layout);
