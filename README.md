# Brewblox UI

> UI representation of the Brewblox project

## Requirements

* Node.js
* NPM
* Docker
* Docker-compose

Due to limitations in the way Docker is handled on Windows and Mac, a Linux-based OS is required for development.

If you're determined to make it work on either Windows or Mac, feel free to contact us for a more detailed explanation.

## Installation

**This will install the development version of brewblox-ui. The user install guide for Brewblox can be found at https://brewblox.netlify.com/**

Note: this is tested on Ubuntu, and may or may not work on other distros. Please let us know if there are any issues.

``` bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential libssl-dev curl git python3-pip

# Install Node Version Manager + Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
nvm install --lts

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
npm install -g @quasar/cli
npm ci -d
docker-compose pull
```

## Run

``` bash
npm start
```

The UI will be served with hot reloading at https://localhost:8080/ui

## Additional dev commands

```bash
# Restart backend containers
npm run compose:new

# Reset widgets
npm run datastore:load

# Reset Spark blocks
npm run spark:load

# Build a production version of the software
# This is served at https://localhost:9001
npm run devbuild
```

## Loading and saving backend data

Every time you run `npm start`, data on the backend is reset to defaults.
The default data can be found in dev/presets/.

The dev scripts allow for partially applying data, or replacing the defaults.

Some examples:
* `npm run datastore` only resets widgets
* `npm run spark` only resets blocks
* `npm run spark -- sparkey` only resets blocks on Sparkey

You can use `npm run datastore:save` and `npm run spark:save` to replace the defaults.
The files are indexed in git. Commit them to make the change permanent.

---


# Architecture

## Directory structure

Brewblox uses and extends the [Quasar application structure](https://quasar.dev/quasar-cli/cli-documentation/directory-structure).

Notable new directories:

**src/helpers/** - Stateless utility functions.

**src/plugins/** - Application submodules. Plugins behave like [Vue plugins](https://vuejs.org/v2/guide/plugins.html) in that they have an `install(Vue: VueConstructor)` function. <br>
Plugins may have their own `components/`, `helpers/`, and `store/` subdirectories. <br>
New plugins should be declared in `src/boot/plugins.ts`.

## Third-party plugins

To allow runtime extension of the UI, users can load remote plugins.
These will be loaded from user-defined URLs, and are otherwise treated as identical to plugins found in `src/plugins/`.

For an example of how to create a remote plugin, see the [brewblox-plugin](https://github.com/BrewBlox/brewblox-plugin) repository.

# Data sources

## [Datastore](src/plugins/database/types.ts)

Local application state is kept using [VueX](https://vuex.vuejs.org/guide/). Settings that are not session-specific (`Dashboard`, `Widget`, `Service`) are persisted to the CouchDB [datastore](https://pouchdb.com/).

The full datastore state is loaded on startup. After that, two-way synchronization is maintained between VueX (local), and CouchDB (remote).

## [Eventbus](src/plugins/eventbus.ts)

Backend services can continuously push data over the RabbitMQ eventbus. These events are then converted into Server Sent Events (SSE) by the [brewblox-emitter](https://github.com/BrewBlox/brewblox-emitter) service.

The SSE connection is managed centrally, and plugins can subscribe to receive callbacks for events matching an identifier.

# Interfaces

There are some generic interfaces used throughout the UI. Plugins can register functionality they provide.

## [Dashboard, Widget](src/store/dashboards/types.ts)

To ensure flexibility, one of the core display elements in the UI is the `Dashboard`. A dashboard is populated with `Widget` elements.

`Widget` data blobs are loaded from the store. The dashboard uses the `widget.feature` property to find the Vue component capable of rendering the data.

This allows the user to display the most relevant items, regardless of whether they are core Brewblox components, or added by a third-party plugin.

## [Service](src/store/services/index.ts)

While widgets are displayed on dashboards, services get their own page.

Other than that, they're very much alike: they have persistent configuration, and are implemented by plugins.

## [Feature](src/store/features/types.ts)

Widgets and Services by themselves are nothing more than blobs of JSON data. In order for them to be created and rendered, they must be combined with Vue components.

Features are how the UI knows which components can be used to render data. Plugins can use their `install(Vue)` function to register features.

As Features contain functions and references to Vue components, they are not persisted in the datastore.
