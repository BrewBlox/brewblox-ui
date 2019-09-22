<script lang="ts">
import mapValues from 'lodash/mapValues';
import UrlSafeString from 'url-safe-string';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { suggestId, validator, valOrDefault } from '@/helpers/functional';
import { typeName as sparkType } from '@/plugins/spark/getters';
import { blockIdRules } from '@/plugins/spark/helpers';
import { GroupsBlock } from '@/plugins/spark/provider/types';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

import { HermsBlockNames, HermsConfig } from './types';


@Component
export default class HermsNamingTask extends WizardTaskBase<HermsConfig> {
  chosenNames: Partial<HermsBlockNames> = {};

  get defaultNames(): HermsBlockNames {
    return {
      hltSensor: 'HLT Sensor',
      hltDriver: 'HLT Setpoint Driver',
      hltSetpoint: 'HLT Setpoint',
      hltPid: 'HLT PID',
      hltPwm: 'HLT PWM',
      hltAct: 'HLT Actuator',
      mtSensor: 'MT Sensor',
      mtSetpoint: 'MT Setpoint',
      mtPid: 'MT PID',
      bkSensor: 'BK Sensor',
      bkSetpoint: 'BK Setpoint',
      bkPid: 'BK PID',
      bkPwm: 'BK PWM',
      bkAct: 'BK Actuator',
      mutex: 'Mutex',
      balancer: 'Balancer',
    };
  }

  get services(): Service[] {
    return serviceStore.typedServices(sparkType);
  }

  get serviceId(): string {
    return this.config.serviceId || this.services[0].id;
  }

  set serviceId(serviceId: string) {
    this.updateConfig({ ...this.config, serviceId });
  }

  get groupError(): string | null {
    if (!this.serviceId) {
      return null;
    }
    const block: GroupsBlock | undefined =
      sparkStore.blockValues(this.serviceId)
        .find(block => block.type === 'Groups');
    const names = sparkStore.groupNames(this.serviceId);
    return block && block.data.active.includes(0)
      ? null
      : `Group '${names[0]}' is disabled. Created blocks will be inactive.`;
  }

  get arrangementId(): string {
    return valOrDefault(this.config.arrangementId, 'HERMS');
  }

  set arrangementId(id: string) {
    this.updateConfig({ ...this.config, arrangementId: id });
  }

  get prefix(): string {
    return valOrDefault(this.config.prefix, this.arrangementId.slice(0, 5));
  }

  set prefix(prefix: string) {
    this.updateConfig({ ...this.config, prefix });
  }

  get dashboardTitle(): string {
    return valOrDefault(this.config.dashboardTitle, `${this.arrangementId} Dashboard`);
  }

  set dashboardTitle(id: string) {
    this.updateConfig({ ...this.config, dashboardTitle: id });
  }

  get names(): HermsBlockNames {
    return {
      ...mapValues(this.defaultNames,
        v => suggestId(`${this.prefix} ${v}`, validator(blockIdRules(this.serviceId)))),
      ...this.chosenNames,
    };
  }

  get nameRules(): InputRule[] {
    return [
      ...blockIdRules(this.serviceId),
      v => Object.values(this.names)
        .filter(n => n === v).length < 2 || "Name can't be a duplicate",
    ];
  }

  get valuesOk(): boolean {
    return [
      this.serviceId,
      this.dashboardTitle,
      Object.values(this.names).every(validator(this.nameRules)),
    ]
      .every(Boolean);
  }

  updateName(key: string, val: string): void {
    this.$set(this.chosenNames, key, val.trim());
  }

  clearKey(key: string): void {
    this.$delete(this.config, key);
    this.updateConfig(this.config);
  }

  clearName(key: string): void {
    this.$delete(this.chosenNames, key);
  }

  taskDone(): void {
    this.updateConfig({
      ...this.config,
      serviceId: this.serviceId,
      arrangementId: this.arrangementId,
      prefix: this.prefix,
      dashboardId: new UrlSafeString().generate(this.dashboardTitle),
      dashboardTitle: this.dashboardTitle,
      names: this.names,
      widgets: [],
      createdBlocks: [],
      changedBlocks: [],
      renamedBlocks: {},
    });
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section style="height: 60vh">
      <q-scroll-area>
        <q-item dark class="text-weight-light">
          <q-item-section>
            <q-item-label class="text-subtitle1">
              Name your blocks and dashboards
            </q-item-label>
            <p>
              Enter a name for your new process below. The prefix will be used to suggest names for your new blocks.
            </p>
          </q-item-section>
        </q-item>

        <CardWarning v-if="groupError">
          <template #message>
            {{ groupError }}
          </template>
        </CardWarning>

        <!-- Generic settings -->
        <q-expansion-item default-opened label="Settings" icon="settings" dense>
          <QuickStartServiceField v-model="serviceId" :services="services" />
          <QuickStartNameField
            v-model="arrangementId"
            label="Arrangement name"
            @clear="clearKey('arrangementId')"
          >
            <template #help>
              The full name of your arrangement.
              It will be used as the default dashboard title.
              <br />The default prefix is the short version of this.
            </template>
          </QuickStartNameField>
          <QuickStartNameField
            v-model="prefix"
            optional
            label="Prefix"
            @clear="clearKey('prefix')"
          >
            <template #help>
              By default all block names are prefixed.
              You can override this for individual blocks.
            </template>
          </QuickStartNameField>
          <QuickStartNameField
            v-model="dashboardTitle"
            label="Dashboard"
            @clear="clearKey('dashboardTitle')"
          >
            <template #help>
              The name for the new dashboard
            </template>
          </QuickStartNameField>
        </q-expansion-item>

        <!-- Block names -->
        <q-expansion-item label="Block names" icon="mdi-tag-multiple" dense>
          <QuickStartNameField
            v-for="(nVal, nKey) in names" :key="nKey"
            :value="nVal"
            :label="defaultNames[nKey]"
            :rules="nameRules"
            @clear="clearName(nKey)"
            @input="v => updateName(nKey, v)"
          >
          </QuickStartNameField>
        </q-expansion-item>
      </q-scroll-area>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
