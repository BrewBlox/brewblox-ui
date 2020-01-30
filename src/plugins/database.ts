/* eslint-disable @typescript-eslint/camelcase */
import PouchDB from 'pouchdb';
import { VueConstructor } from 'vue';

import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

export interface StoreObject {
  id: string;
  _rev?: string;
}

export interface Module {
  id: string;
  onChanged: (obj: any) => void;
  onDeleted: (id: string) => void;
}

const cleanId = (moduleId: string, fullId: string): string =>
  fullId.substring(`${moduleId}__`.length);

const fullId = (moduleId: string, id: string): string =>
  `${moduleId}__${id}`;

const checkInModule = (moduleId: string, fullId: string): boolean =>
  fullId.startsWith(`${moduleId}__`);

const asStoreObject = (moduleId: string, doc: any): any => {
  const { _id, ...obj } = doc;
  return { ...obj, id: cleanId(moduleId, _id) };
};

const asDocument = (moduleId: string, obj: any): any => {
  const { id, ...doc } = obj;
  return { ...doc, _id: fullId(moduleId, id) };
};

const asNewDocument = (moduleId: string, obj: any): any => {
  delete obj._rev;
  return asDocument(moduleId, obj);
};

export class BrewbloxDatabase {
  private promisedDb: Promise<PouchDB.Database>;
  private modules: Module[] = [];

  public constructor() {
    this.promisedDb = new Promise((resolve) => {
      const remoteAddress = `${HOST}/datastore/brewblox-ui-store`;
      const remoteDb: PouchDB.Database = new PouchDB(remoteAddress);

      this.checkRemote(remoteDb)
        .then(async () => {
          remoteDb
            .changes({ live: true, include_docs: true, since: 'now' })
            .on('change', (evt: ChangeEvent) => {
              const handler = this.modules.find(m => checkInModule(m.id, evt.id));
              if (evt.deleted) {
                handler?.onDeleted(cleanId(handler.id, evt.id));
              } else {
                handler?.onChanged(asStoreObject(handler.id, evt.doc));
              }
            });

          resolve(remoteDb);
        });
    });
  }

  private async checkRemote(db: PouchDB.Database): Promise<void> {
    await db.info()
      .catch((e) => {
        notify.error(`Remote database unavailable: ${e.message}`, { shown: false });
      });
  };

  private intercept(message: string, moduleId: string): (e: Error) => never {
    return (e: Error) => {
      notify.error(`DB error in ${message}(${moduleId}): ${e.message}`, { shown: false });
      throw e;
    };
  }

  public registerModule(module: Module): void {
    if (this.modules.find(m => m.id === module.id)) {
      throw new Error(`Database module '${module.id}' is already registered`);
    }
    this.modules.push({ ...module });
  }

  public async fetchAll(moduleId: string): Promise<any[]> {
    const db = await this.promisedDb;
    const resp = await db.allDocs({ include_docs: true })
      .catch(this.intercept('Fetch all objects', moduleId));
    return resp.rows
      .filter(row => checkInModule(moduleId, row.id))
      .map(row => asStoreObject(moduleId, row.doc));
  }

  public async fetchById<T extends StoreObject>(
    moduleId: string, objId: string
  ): Promise<T> {
    const db = await this.promisedDb;
    const obj = await db.get(fullId(moduleId, objId))
      .catch(this.intercept(`Fetch '${objId}'`, moduleId));
    return asStoreObject(moduleId, obj);
  }

  public async create<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    const resp = await db.put(asNewDocument(moduleId, obj))
      .catch(this.intercept('Create object', moduleId));
    return { ...obj, _rev: resp.rev };
  }

  public async persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    const resp = await db.put(asDocument(moduleId, obj))
      .catch(this.intercept('Persist object', moduleId));
    return { ...obj, _rev: resp.rev };
  }

  public async remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    await db.remove(asDocument(moduleId, obj))
      .catch(this.intercept('Remove object', moduleId));
    delete obj._rev;
    return obj;
  }
}

const checkDatastore = (): void => {
  const addr = `${HOST}/datastore`;

  const request = new XMLHttpRequest();
  request.open('GET', addr, true);
  request.onerror = () => notify.error({
    timeout: 0,
    icon: 'error',
    message: 'Failed to access the datastore',
    actions: [
      {
        label: 'Reload page',
        textColor: 'white',
        handler: () => location.reload(),
      },
    ],
  });
  request.send();
};

export default {
  install(Vue: VueConstructor) {
    Vue.$database = new BrewbloxDatabase();
    Vue.$startup.onStart(checkDatastore);
  },
};
