# BrewBlox UI

> UI representation of the BrewBlox project

## Requirements

* Node.js
* NPM
* Docker
* Docker-compose

## Run

``` bash
# install dependencies
$ npm install
$ docker-compose pull


# serve with hot reload at localhost:8080
$ npm start
```

## Additional dev commands

```bash
# Restart backend containers
$ npm run compose:new

# Build a production version of the software. This is served at localhost:9000
$ npm run devbuild
```

---

# Architecture Concepts

BrewBlox mostly adheres to the [Vue application structure][vue-structure], but defines a set of concepts within this framework.

### Dashboard

The BrewBlox UI is centered around the concept of it being a dashboard that can be filled by whatever is relevant to the user. Dashboards are agnostic displays of widgets.

### Provider

Each device or service supported by the BrewBlox UI is implemented as a provider. All interaction with those supported devices or services is encapsulated here.

Providers are modular, and placed in the `plugins` directory.

### Service

Services are instances of Providers. If you have two connected Sparks, you'll be using two separate services as created by the `Spark` provider.

### Feature

Providers offer one or more features. Features provide the Vue components required to render and support dashboard items.

### Dashboard Item

Comparable to how services are instances of providers, dashboard items are instances of features.

### Widget, Wizard, Form

To implement specific functionality, features can offer various Vue components, inheriting from a generic base class.

* To be displayed on a dashboard, a feature must have a widget.
* To allow the user to create new dashboard items, a feature must have a wizard.
* For more extensive configuration, features can provide a Form. These are rendered in modal windows.

## Datastore

Local application state is kept using [VueX][vuex]. Settings that are not session-specific (dashboards, dashboard items, services) are persisted to the BrewBlox [datastore].

The full datastore state is loaded on startup, and all changes are persisted here.


---

# How do I....

## Support a new device (add a provider)

In order to support the `gizmo` device:

* Create the `src/plugins/gizmo` directory.
* In `src/plugins/gizmo/index.ts`, add an initializer:
```js
import providerStore from '@/store/providers';

export default({ store, router }: PluginArguments) => {
  providerStore.createProvider({
    id: 'Gizmo',
    displayName: 'Totally Awesome Gizmo Device',

    // IDs of separately created features
    features: [],

    // Called whenever a new service is created
    onAdd: async (service) => {},

    // Called whenever a service is removed
    onRemove: async (service) => {},

    // Called after a service is created
    onFetch: async (service) => {},

    // Globally registered Vue components
    wizard: 'GizmoWizard',
    page: 'GizmoPage',
  });
}
```
* Add your plugin to the list of known plugins in `src/main.ts`.
```js
import gizmo from './plugins/gizmo'

const plugins = [
  portal,
  spark,
  history,
  gizmo, // new
];
```

## Add a separate store for my provider

Plugins can define and register their own store modules.

```js
import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';

@Module({ store, namespaced: true, dynamic: true, name: 'providers' })
export class GizmoModule extends VuexModule {
  public gizmos: Record<String, any> = {};
  public gadgets: any[] = [];

  public get awesome(): boolean {
    return true;
  }

  @Mutation
  public setGizmo(gizmo: Gizmo): void {
    // Using Vue.set ensures the new gizmo is picked up by reactive getters
    Vue.set(this.gizmos, gizmo.id, gizmo);
  }

  @Mutation
  public addGadget(gadget: Gadget): void {
    // Array.prototype.push is watched by Vue, and will be reactive
    this.gadgets.push(gadget);
  }

  // the commit will be automatically called with the return value
  @Action({ commit: 'addGadget' })
  public async createGadget() {
    return { name: 'new gadget' };
  }
}

// Allows directly calling getters and functions in components
export default getModule(GizmoModule)
```





[datastore]: https://github.com/BrewBlox/brewblox-datastore
[vuex]: https://vuex.vuejs.org/guide/
[vue-structure]: https://vuex.vuejs.org/guide/structure.html
[dynamic-vuex]: https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration
