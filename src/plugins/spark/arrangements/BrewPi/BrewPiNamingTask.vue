<script lang="ts">
import UrlSafeString from 'url-safe-string';
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { serviceValues } from '@/store/services/getters';
import { typeName, blockIds } from '@/plugins/spark/store/getters';
import { BrewPiConfig, BrewPiConfigNames } from '@/plugins/spark/arrangements/BrewPi/state';
import { spaceCased, valOrDefault } from '@/helpers/functional';
import { dashboardItemIds } from '@/store/dashboards/getters';


@Component
export default class BrewPiNamingTask extends WizardTaskBase {
  chosenNames: Partial<BrewPiConfigNames> = {};

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  get serviceOpts() {
    return serviceValues(this.$store)
      .filter(svc => svc.type === typeName)
      .map(svc => ({ label: svc.title, value: svc.id }));
  }

  get serviceId() {
    let id = this.cfg.serviceId;
    if (!id && this.serviceOpts.length > 0) {
      id = this.serviceOpts[0].value;
    }
    return id;
  }

  set serviceId(id: string) {
    this.updateConfig<BrewPiConfig>({ ...this.cfg, serviceId: id });
  }

  get arrangementId() {
    return valOrDefault(this.cfg.arrangementId, 'BrewPi');
  }

  set arrangementId(id: string) {
    this.updateConfig<BrewPiConfig>({ ...this.cfg, arrangementId: id });
  }

  get prefix() {
    return valOrDefault(this.cfg.prefix, this.arrangementId.slice(0, 6));
  }

  set prefix(prefix: string) {
    this.updateConfig<BrewPiConfig>({ ...this.cfg, prefix });
  }

  get dashboardTitle() {
    return valOrDefault(this.cfg.dashboardTitle, `${this.arrangementId} Dashboard`);
  }

  set dashboardTitle(id: string) {
    this.updateConfig<BrewPiConfig>({ ...this.cfg, dashboardTitle: id });
  }

  get groups() {
    return valOrDefault(this.cfg.groups, [0]);
  }

  set groups(groups: number[]) {
    this.updateConfig<BrewPiConfig>({ ...this.cfg, groups });
  }

  get defaultNames(): BrewPiConfigNames {
    return {
      fridgeSensor: `${this.prefix} fridge sensor`,
      beerSensor: `${this.prefix} beer sensor`,
      fridgeSetpoint: `${this.prefix} fridge setpoint`,
      beerSetpoint: `${this.prefix} beer setpoint`,
      fridgeSSPair: `${this.prefix} fridge SSPair`,
      beerSSPair: `${this.prefix} beer SSPair`,
      coolPin: `${this.prefix} cool pin`,
      heatPin: `${this.prefix} heat pin`,
      coolPwm: `${this.prefix} cool PWM`,
      heatPwm: `${this.prefix} heat PWM`,
      mutex: `${this.prefix} mutex`,
      coolPid: `${this.prefix} cool PID`,
      heatPid: `${this.prefix} heat PID`,
      beerPid: `${this.prefix} beer PID`,
      fridgeOffset: `${this.prefix} fridge offset`,
    };
  }

  get names(): BrewPiConfigNames {
    return {
      ...this.defaultNames,
      ...this.chosenNames,
    };
  }

  get valuesOk() {
    return [
      this.serviceId,
      this.dashboardTitle,
      ...Object.values(this.names),
      ...Object.values(this.names).map(v => !this.nameExists(v)),
    ]
      .every(Boolean);
  }

  nameExists(val: string) {
    if (!this.serviceId) {
      return false;
    }
    return [
      ...blockIds(this.$store, this.serviceId),
      ...dashboardItemIds(this.$store),
    ]
      .includes(val);
  }

  updateName(key: string, val: string) {
    this.$set(this.chosenNames, key, val.trim());
  }

  clearKey(key: string) {
    delete this.cfg[key];
    this.updateConfig<BrewPiConfig>(this.cfg);
  }

  clearName(key: string) {
    this.$delete(this.chosenNames, key);
  }

  spaceCased(s: string) {
    return spaceCased(s);
  }

  next() {
    this.updateConfig<BrewPiConfig>({
      ...this.cfg,
      serviceId: this.serviceId,
      arrangementId: this.arrangementId,
      dashboardId: new UrlSafeString().generate(this.dashboardTitle),
      dashboardTitle: this.dashboardTitle,
      groups: this.groups,
      names: this.names,
      widgets: [],
      createdBlocks: [],
      changedBlocks: [],
      renamedBlocks: {},
    });
    this.pushTask('BrewPiHardwareTask');
    this.finish();
  }
}
</script>

<template>
  <div>
    <q-card-section class="row no-wrap">
      <div>
        <q-list no-border>
          <q-item dark>
            <big>Arrangement</big>
          </q-item>
          <q-item dark>
            <q-select
              v-model="serviceId"
              :options="serviceOpts"
              options-dark
              map-options
              label="Service"
              dark
            />
          </q-item>
          <q-item dark>
            <q-input v-model="arrangementId" label="Arrangement name" dark>
              <template v-slot:append>
                <q-btn
                  icon="mdi-backup-restore"
                  flat
                  size="sm"
                  color="white"
                  @click="clearKey('arrangementId')"
                />
              </template>
            </q-input>
          </q-item>
          <q-item dark>
            <q-input v-model="prefix" label="Widget prefix" dark>
              <template v-slot:append>
                <q-btn
                  icon="mdi-backup-restore"
                  flat
                  size="sm"
                  color="white"
                  @click="clearKey('prefix')"
                />
              </template>
            </q-input>
          </q-item>
          <q-item dark>
            <q-input v-model="dashboardTitle" :error="!dashboardTitle" label="Dashboard" dark>
              <template v-slot:append>
                <q-btn
                  icon="mdi-backup-restore"
                  flat
                  size="sm"
                  color="white"
                  @click="clearKey('dashboardTitle')"
                />
              </template>
            </q-input>
          </q-item>
          <q-item dark>
            <big>Groups</big>
          </q-item>
          <q-item dark>
            <GroupsPopupEdit
              v-if="serviceId"
              :field="groups"
              :service-id="serviceId"
              :change="v => groups = v"
              tag="span"
              dark
            />
            <q-item-label v-else>No service selected</q-item-label>
          </q-item>
        </q-list>
      </div>
      <div>
        <q-list no-border>
          <q-item dark>
            <big>Widget Names</big>
          </q-item>
          <q-item v-for="(nVal, nKey) in names" :key="nKey">
            <q-input
              :value="nVal"
              :error="!nVal || nameExists(nVal)"
              :label="spaceCased(nKey)"
              dark
              bottom-slots
              @input="v => updateName(nKey, v)"
            >
              <template v-slot:append>
                <q-btn
                  icon="mdi-backup-restore"
                  flat
                  size="sm"
                  color="white"
                  @click="clearName(nKey)"
                />
              </template>
              <template v-slot:error>Name must not exist, and not be empty</template>
            </q-input>
          </q-item>
        </q-list>
      </div>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        class="full-width"
        @click="next"
      />
    </q-card-actions>
  </div>
</template>
