import { create, fetchAll, fetchById, persist, registerModule, remove } from '@/helpers/database';

import { BuilderStage } from '../types';

const STAGES = 'stages';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    registerModule({ onChanged, onDeleted, id: STAGES });

export const fetchStages = async (): Promise<BuilderStage[]> =>
  fetchAll(STAGES);

export const fetchStageById = async (id: string): Promise<BuilderStage> =>
  fetchById(STAGES, id);

export const createStage = async (service: BuilderStage): Promise<BuilderStage> =>
  create(STAGES, service);

export const persistStage = async (service: BuilderStage): Promise<BuilderStage> =>
  persist(STAGES, service);

export const deleteStage = async (service: BuilderStage): Promise<BuilderStage> =>
  remove(STAGES, service);
