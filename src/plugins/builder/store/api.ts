import database from '@/plugins/database';

import { BuilderLayout } from '../types';

const LAYOUTS = 'layouts';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    database.registerModule({ onChanged, onDeleted, id: LAYOUTS });

export const fetchLayouts = async (): Promise<BuilderLayout[]> =>
  database.fetchAll(LAYOUTS);

export const fetchLayoutById = async (id: string): Promise<BuilderLayout> =>
  database.fetchById(LAYOUTS, id);

export const createLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  database.create(LAYOUTS, layout);

export const persistLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  database.persist(LAYOUTS, layout);

export const deleteLayout = async (layout: BuilderLayout): Promise<BuilderLayout> =>
  database.remove(LAYOUTS, layout);
