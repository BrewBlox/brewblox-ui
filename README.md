# BrewBlox UI

> UI representation of the BrewBlox project

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

# Build a production version of the software
# This is served at https://localhost:9001
npm run devbuild
```

---

# Architecture Concepts

BrewBlox mostly adheres to the [Vue application structure][vue-structure], but defines a set of concepts within this framework.

### Dashboard

To ensure flexibility, one of the core display elements in the UI is the dashboard.

A dashboard can display anything that implements the `Widget` component interface. This allows the user to display the most relevant items, regardless of whether they are core BrewBlox components, or added by a third-party plugin.

### Plugin

To allow runtime extension of the UI, users can load plugins. For more information on how Vue plugins work, see the [Vue documentation page](https://vuejs.org/v2/guide/plugins.html). For an example of how to create a BrewBlox plugin, see the [brewblox-plugin](https://github.com/BrewBlox/brewblox-plugin) repository.

### Provider

Each device or service supported by the BrewBlox UI is implemented as a provider. All interaction with those supported devices or services is encapsulated here.

Providers can be registered by third-party plugins.
If you only want to add independent widgets, you don't need to add a provider.

### Service

Services are instances of Providers. If you have two connected Sparks, you'll be using two separate services as created by the `Spark` provider.
Service configuration is persisted in the datastore.

### Feature

Plugins can register one or more features. Features define the Vue components required to create and render individual widgets.

### PersistentWidget

Comparable to how `Service` is an instance of `Provider`, `PersistentWidget` is an instance of `Feature`.
Just as with Services, the configuration for each PersistentWidget is stored in the datastore.

### Widget, Wizard

To implement functionality, features have to register various Vue components. These components are expected to implement common interfaces, as they will be instantiated by generic components (dashboard for widgets, wizard picker for wizards).

* A feature must implement a `Widget` component to be displayed on a dashboard or in a modal dialog.
* To allow creation of `PersistentWidget`s, the feature can implement a `Wizard` component.
  * The wizard is optional: some features are created or discovered automatically.

## Datastore

Local application state is kept using [VueX][vuex]. Settings that are not session-specific (`Dashboard`, `PersistentWidget`, `Service`) are persisted to the BrewBlox [datastore](https://pouchdb.com/).

The full datastore state is loaded on startup, and all changes are persisted here.



[vuex]: https://vuex.vuejs.org/guide/
[vue-structure]: https://vuex.vuejs.org/guide/structure.html
[dynamic-vuex]: https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration
