import database from '@/plugins/database';
import { UIPlugin } from '@/store/plugins';

const PLUGINS = 'plugins';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    database.registerModule({ onChanged, onDeleted, id: PLUGINS });

export const fetchPlugins = async (): Promise<UIPlugin[]> =>
  database.fetchAll(PLUGINS);

export const fetchPluginById = async (id: string): Promise<UIPlugin> =>
  database.fetchById(PLUGINS, id);

export const createPlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  database.create(PLUGINS, plugin);

export const persistPlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  database.persist(PLUGINS, plugin);

export const deletePlugin = async (plugin: UIPlugin): Promise<UIPlugin> =>
  database.remove(PLUGINS, plugin);
