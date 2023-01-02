# Brewblox UI

> UI representation of the Brewblox project

## Requirements

* Node.js
* Yarn
* Docker
* Docker-compose

Due to limitations in the way Docker is handled on Windows, Linux or Mac is required for development.

## Installation

**This will install the development version of brewblox-ui. The user install guide for Brewblox can be found at <https://brewblox.netlify.app/>**

Note: this is tested on Ubuntu, and may or may not work on other distros. Please let us know if there are any issues.

``` bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential libssl-dev curl git python3-pip

# Install Node Version Manager + Node.js + Yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
nvm install --lts
npm install -g yarn

# Install Docker
curl -sL https://get.docker.com | bash

# Install docker-compose
pip3 install --user -U docker-compose

# Allow running docker without sudo
sudo usermod -aG docker $USER

# A reboot is required for the user permissions to take effect
reboot
```

After the reboot, run the following commands in the `brewblox-ui` directory:

``` bash
yarn ci
docker-compose pull
```

## Run

``` bash
yarn start
```

The UI will be served with hot reloading at <https://localhost:8080/ui>

## Additional dev commands

```bash
# Restart backend containers
yarn compose:new

# Reset widgets
yarn datastore:load

# Reset Spark blocks
yarn spark:load

# Build output is hosted at :9001/ui
yarn build

# Generate import types for global components
yarn components

# Pull shared types for a specific firmware build
# Develop is used by default, but a branch name argument can be used
yarn firmware
```

## Common issues

### MetricsWidget.vue is blocked

uBlock Origin and Privacy Badger will block the Metrics widget when in dev mode.
To bypass this, add `localhost` as trusted domain in the extension settings.

### Chrome dev requests are pending forever

In dev mode, the large number of concurrently downloaded files can cause Chrome to exceed its file handle limit.
When this happens, requests to the dev server are stuck forever as *pending*.\
To fix this, add the following line to both `/etc/systemd/system.conf` and `/etc/systemd/user.conf`:

```ini
DefaultLimitNOFILE=65536
```

### Tests hang forever

If tests silently hang, this may be due to circular dependencies.
Use <https://github.com/pahen/madge> to analyze and resolve the problem.

## Loading and saving backend data

Every time you run `yarn start`, data on the backend is reset to defaults.
The default data can be found in dev/presets/.

The dev scripts allow for partially applying data, or replacing the defaults.

Some examples:

* `yarn redis` only resets widgets
* `yarn spark` only resets blocks
* `yarn spark -- sparkey` only resets blocks on Sparkey

You can use `yarn redis:save` and `yarn spark:save` to replace the defaults.
The files are indexed in git. Commit them to make the change permanent.

## Architecture

### Directory structure

Brewblox uses and extends the [Quasar application structure](https://next.quasar.dev/quasar-cli/directory-structure).

Notable new directories:

**src/utils/** - Stateless utility functions.

**src/plugins/** - Application submodules. Plugins behave like [Vue plugins](https://v3.vuejs.org/guide/plugins.html) in that they have an `install(app: App)` function.\
Plugins may have their own `components/`, `utils/`, and `store/` subdirectories.\
New plugins should be declared in `src/main.ts`.

### Third-party plugins (discontinued)

~~To allow runtime extension of the UI, users can load remote plugins.~~
~~These will be loaded from user-defined URLs, and are otherwise treated as identical to plugins found in `src/plugins/`.~~

~~For an example of how to create a remote plugin, see the [brewblox-plugin](https://github.com/BrewBlox/brewblox-plugin) repository.~~

Third-party plugins are no longer supported.
Implementation beyond proof-of-concept would require too much effort for a feature with no discernible demand.

## Data sources

### [Datastore](src/database/types.ts)

Local application state is kept using [Pinia](https://pinia.esm.dev/). Persistent data (eg. `Dashboard`, `Widget`, `Service`) is saved using the Redis [datastore](https://redis.io/).

The full datastore state is loaded on startup. After that, two-way synchronization is maintained between VueX (local), and Redis (remote).

### [Eventbus](src/eventbus.ts)

Backend services intermittently push MQTT state events.

Plugins can subscribe to receive callbacks for events matching an identifier.

## Interfaces

There are some generic interfaces used throughout the UI. Plugins can register functionality they provide.

### [Dashboard](src/store/dashboards/types.ts), [Widget](src/store/widgets/types.ts)

To ensure flexibility, one of the core display elements in the UI is the `Dashboard`. A dashboard is populated with `Widget` elements.

`Widget` data blobs are loaded from the store. The dashboard uses the `widget.feature` property to find the Vue component capable of rendering the data.

This allows the user to display the most relevant items, regardless of whether they are core Brewblox components, or added by a third-party plugin.

### [Service](src/store/services/index.ts)

While widgets are displayed on dashboards, services get their own page.

Other than that, they're very much alike: they have persistent configuration, and are implemented by plugins.

### [Feature](src/store/features/types.ts)

Widgets and Services by themselves are nothing more than blobs of JSON data. In order for them to be created and rendered, they must be combined with Vue components.

Features are how the UI knows which components can be used to render data. Plugins can use their `install(Vue)` function to register features.

As features contain functions and references to Vue components, they are not persisted in the datastore.
