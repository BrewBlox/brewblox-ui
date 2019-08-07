/* eslint-disable @typescript-eslint/camelcase */
import PouchDB from 'pouchdb';
import { VueConstructor } from 'vue';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

interface InstallOpts {
  host: string;
  name: string;
}

export interface StoreObject {
  id: string;
  _rev?: string;
  [key: string]: any;
}

export interface Module {
  onDeleted: (id: string) => void;
  onChanged: (obj: any) => void;
  id: string;
}

interface DBError {
  time: string;
  message: string;
  moduleId: string;
  content: string;
  error: string;
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

export class BrewBloxDatabase {
  private _db: Promise<PouchDB.Database> | null = null;

  private modules: Module[] = [];
  private dbErrors: DBError[] = [];

  /*
  * The database is used as a singleton with explicit construction.
  * The install() function creates the Promise<PouchDB.Database>.
  * All functions that use the database must wait for the promise to resolve.
  */
  private get promisedDb(): Promise<PouchDB.Database> {
    if (this._db === null) {
      throw new Error('Database must be installed before it can be used');
    }
    return this._db;
  }

  // install(Vue, options) is a required entrypoint for a Vue plugin
  public install(Vue: VueConstructor, opts: InstallOpts) {
    this._db = new Promise((resolve) => {
      const { host, name } = opts;
      const remoteAddress = `${host}/datastore/${name}`;
      const remoteDb: PouchDB.Database = new PouchDB(remoteAddress);

      this.checkRemote(remoteDb)
        .then(async () => {
          remoteDb
            .changes({ live: true, include_docs: true, since: 'now' })
            .on('change', (evt: ChangeEvent) => {
              const handler = this.modules.find(m => checkInModule(m.id, evt.id));
              if (!handler) {
                return;
              }
              if (evt.deleted) {
                handler.onDeleted(cleanId(handler.id, evt.id));
              } else {
                handler.onChanged(asStoreObject(handler.id, evt.doc));
              }
            });

          resolve(remoteDb);
        });
    });

    // Add as global Vue property to allow it to be used by external plugins
    (Vue as any).database = this;
  }

  private async checkRemote(db: PouchDB.Database) {
    try {
      await db.info();
    } catch (e) {
      this.dbErrors.push({
        message: 'Remote database unavailable',
        moduleId: 'all',
        time: new Date().toString(),
        content: '',
        error: e.message,
      });
    }
  };

  private intercept(message: string, moduleId: string, obj: any = null): (e: Error) => never {
    return (e: Error) => {
      this.dbErrors.push({
        message,
        moduleId,
        time: new Date().toString(),
        content: JSON.stringify(obj),
        error: e.message,
      });
      throw e;
    };
  }

  public getErrors(clear: boolean = false): DBError[] {
    const retval = [...this.dbErrors];
    if (clear) {
      this.dbErrors = [];
    }
    return retval;
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
      .catch(this.intercept('Create object', moduleId, obj));
    return { ...obj, _rev: resp.rev };
  }

  public async persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    const resp = await db.put(asDocument(moduleId, obj))
      .catch(this.intercept('Persist object', moduleId, obj));
    return { ...obj, _rev: resp.rev };
  }

  public async remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    await db.remove(asDocument(moduleId, obj))
      .catch(this.intercept('Remove object', moduleId, obj));
    delete obj._rev;
    return obj;
  }
}

const db = new BrewBloxDatabase();
export default db;
