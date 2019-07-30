import { create, fetchAll, fetchById, persist, registerModule, remove } from '@/helpers/database';
import { UIPlugin } from '@/store/plugins';

const PLUGINS = 'plugins';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    registerModule({ onChanged, onDeleted, id: PLUGINS });

export const fetchPlugins = async (): Promise<UIPlugin[]> =>
  fetchAll(PLUGINS);

export const fetchPluginById = async (id: string): Promise<UIPlugin> =>
  fetchById(PLUGINS, id);

export const createPlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  create(PLUGINS, plugin);

export const persistPlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  persist(PLUGINS, plugin);

export const deletePlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  remove(PLUGINS, plugin);
