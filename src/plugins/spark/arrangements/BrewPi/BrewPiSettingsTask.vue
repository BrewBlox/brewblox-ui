<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Link, Unit } from '@/helpers/units';
import { typeName as graphType } from '@/plugins/history/Graph/getters';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/types';
import { typeName as offsetType } from '@/plugins/spark/features/ActuatorOffset/getters';
import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { typeName as mutexType } from '@/plugins/spark/features/Mutex/getters';
import { typeName as pidType } from '@/plugins/spark/features/Pid/getters';
import { typeName as spProfileType } from '@/plugins/spark/features/SetpointProfile/getters';
import { typeName as pairType } from '@/plugins/spark/features/SetpointSensorPair/getters';
import sparkStore from '@/plugins/spark/store';
import dashboardStore from '@/store/dashboards';
import { Dashboard } from '@/store/dashboards';
import featureStore from '@/store/features';

@Component
export default class BrewPiSettingsTask extends WizardTaskBase {
  readonly config!: BrewPiConfig;

  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');

  get userTemp(): string {
    return sparkStore.units(this.config.serviceId).Temp;
  }

  defaultTemp(): Unit {
    const defaultTempValues = { degC: 20, degF: 68, degK: 293 };
    return new Unit(defaultTempValues[this.userTemp] || 20, this.userTemp);
  }

  blockType(newId: string): string {
    for (let [from, to] of Object.entries(this.config.renamedBlocks)) {
      if (to === newId) {
        return sparkStore.blockById(this.config.serviceId, from).type;
      }
    }
    throw new Error('Old block not found');
  }

  defineCreatedBlocks() {
    this.config.createdBlocks = [
      // setpoint sensor pair
      {
        id: this.config.names.fridgeSSPair,
        serviceId: this.config.serviceId,
        type: pairType,
        groups: this.config.groups,
        data: {
          sensorId: new Link(this.config.names.fridgeSensor),
          setting: this.fridgeSetting,
          settingEnabled: true,
        },
      },
      {
        id: this.config.names.beerSSPair,
        serviceId: this.config.serviceId,
        type: pairType,
        groups: this.config.groups,
        data: {
          sensorId: new Link(this.config.names.beerSensor),
          setting: this.beerSetting,
          settingEnabled: true,
        },
      },
      // PWM
      {
        id: this.config.names.coolPwm,
        serviceId: this.config.serviceId,
        type: pwmType,
        groups: this.config.groups,
        data: {
          enabled: true,
          period: new Unit(30, 'minute'),
          actuatorId: new Link(this.config.names.coolPin),
        },
      },
      {
        id: this.config.names.heatPwm,
        serviceId: this.config.serviceId,
        type: pwmType,
        groups: this.config.groups,
        data: {
          enabled: true,
          period: new Unit(10, 'second'),
          actuatorId: new Link(this.config.names.heatPin),
        },
      },
      // Mutex
      {
        id: this.config.names.mutex,
        serviceId: this.config.serviceId,
        type: mutexType,
        groups: this.config.groups,
        data: {
          differentActuatorWait: new Unit(30, 'minute'),
        },
      },
      // Offset Actuator
      {
        id: this.config.names.fridgeDriver,
        serviceId: this.config.serviceId,
        type: offsetType,
        groups: this.config.groups,
        data: {
          enabled: false,
          targetId: new Link(this.config.names.fridgeSSPair),
          referenceId: new Link(this.config.names.beerSSPair),
          referenceSettingOrValue: 0,
          constrainedBy: {
            constraints: [
              { min: -10 },
              { max: 10 },
            ],
          },
        },
      },
      // Setpoint Profile
      {
        id: this.config.names.tempProfile,
        serviceId: this.config.serviceId,
        type: spProfileType,
        groups: this.config.groups,
        data: {
          enabled: false,
          targetId: new Link(this.config.names.beerSSPair),
          points: [],
        },
      },
      // PID
      {
        id: this.config.names.coolPid,
        serviceId: this.config.serviceId,
        type: pidType,
        groups: this.config.groups,
        data: {
          ...sparkStore.specs[pidType].generate(),
          enabled: true,
          inputId: new Link(this.config.names.fridgeSSPair),
          outputId: new Link(this.config.names.coolPwm),
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(-10, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
        },
      },
      {
        id: this.config.names.heatPid,
        serviceId: this.config.serviceId,
        type: pidType,
        groups: this.config.groups,
        data: {
          ...sparkStore.specs[pidType].generate(),
          enabled: true,
          inputId: new Link(this.config.names.fridgeSSPair),
          outputId: new Link(this.config.names.heatPwm),
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(20, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(3, 'minute'),
        },
      },
      {
        id: this.config.names.beerPid,
        serviceId: this.config.serviceId,
        type: pidType,
        groups: this.config.groups,
        data: {
          ...sparkStore.specs[pidType].generate(),
          enabled: false,
          inputId: new Link(this.config.names.beerSSPair),
          outputId: new Link(this.config.names.fridgeDriver),
          filter: 4,
          filterThreshold: new Unit(2, 'delta_degC'),
          kp: new Unit(5, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(0, 'minute'),
        },
      },
    ];
  }

  defineChangedBlocks() {
    this.config.changedBlocks = [
      {
        id: this.config.names.coolPin,
        serviceId: this.config.serviceId,
        type: this.blockType(this.config.names.coolPin),
        groups: this.config.groups,
        data: {
          constrainedBy: {
            constraints: [
              { 'minOff[second]': 300 },
              { 'minOn[second]': 180 },
              { 'mutex<>': this.config.names.mutex },
            ],
          },
        },
      },
      {
        id: this.config.names.heatPin,
        serviceId: this.config.serviceId,
        type: this.blockType(this.config.names.heatPin),
        groups: this.config.groups,
        data: {
          constrainedBy: {
            constraints: [
              { 'mutex<>': this.config.names.mutex },
            ],
          },
        },
      },
    ];
  }

  defineWidgets() {
    const genericSettings = {
      dashboard: this.config.dashboardId,
      cols: 4,
      rows: 4,
      order: 0,
    };

    const variableTypes = {
      fridge: this.blockType(this.config.names.fridgeSensor),
      beer: this.blockType(this.config.names.beerSensor),
      coolPin: this.blockType(this.config.names.coolPin),
      heatPin: this.blockType(this.config.names.heatPin),
    };

    const createWidget =
      (name: string, type: string) => ({
        ...genericSettings,
        ...featureStore.widgetSizeById(type),
        id: uid(),
        title: name,
        feature: type,
        config: {
          blockId: name,
          serviceId: this.config.serviceId,
        },
      });

    const createGraph =
      (name: string) => ({
        ...createWidget(name, graphType),
        pinnedPosition: { x: 1, y: 1 },
        config: {
          layout: {},
          params: { duration: '10m' },
          targets: [
            {
              measurement: this.config.serviceId,
              fields: [
                `${this.config.names.fridgeSSPair}/value[${this.userTemp}]`,
                `${this.config.names.fridgeSSPair}/setting[${this.userTemp}]`,
                `${this.config.names.beerSSPair}/value[${this.userTemp}]`,
                `${this.config.names.beerSSPair}/setting[${this.userTemp}]`,
                `${this.config.names.coolPwm}/value`,
                `${this.config.names.heatPwm}/value`,
              ],
            },
          ],
        },
      });

    this.config.widgets = [
      // PID
      createWidget(this.config.names.coolPid, pidType),
      createWidget(this.config.names.heatPid, pidType),
      createWidget(this.config.names.beerPid, pidType),
      // Setpoint profile
      createWidget(this.config.names.tempProfile, spProfileType),
      // Sensors
      createWidget(this.config.names.fridgeSensor, variableTypes.fridge),
      createWidget(this.config.names.beerSensor, variableTypes.beer),
      // SSPairs are skipped
      // Pins
      createWidget(this.config.names.coolPin, variableTypes.coolPin),
      createWidget(this.config.names.heatPin, variableTypes.heatPin),
      // PWMs
      createWidget(this.config.names.coolPwm, pwmType),
      createWidget(this.config.names.heatPwm, pwmType),
      // Mutex
      createWidget(this.config.names.mutex, mutexType),
      // Offset
      createWidget(this.config.names.fridgeDriver, offsetType),
      // Graph
      createGraph(this.config.names.graph),
    ];
  }

  defineActions() {
    this.pushActions([
      async (config: BrewPiConfig): Promise<void> => {
        await Promise.all(
          Object.entries(config.renamedBlocks)
            .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
            .map(
              ([currVal, newVal]: [string, string]) =>
                sparkStore.renameBlock([config.serviceId, currVal, newVal])));
      },

      async (config: BrewPiConfig): Promise<void> => {
        // Create synchronously, to ensure dependencies are created first
        for (let block of config.createdBlocks) {
          await sparkStore.createBlock([config.serviceId, block]);
        }
      },

      async (config: BrewPiConfig): Promise<void> => {
        await Promise.all(
          config.changedBlocks
            .map(block => sparkStore.saveBlock([config.serviceId, block])));
      },

      async (config: BrewPiConfig): Promise<void> => {
        if (!dashboardStore.dashboardIds.includes(config.dashboardId)) {
          const dashboard: Dashboard = {
            id: config.dashboardId,
            title: config.dashboardTitle,
            order: dashboardStore.dashboardIds.length + 1,
          };
          await dashboardStore.createDashboard(dashboard);
        }
        await Promise.all(
          config.widgets
            .map(item => dashboardStore.appendDashboardItem(item)));
      },
    ]);
  }

  done() {
    this.defineCreatedBlocks();
    this.defineChangedBlocks();
    this.defineWidgets();
    this.defineActions();
    // We're updating all at once, to avoid having to wait a tick before the prop changes
    this.updateConfig(this.config);
    this.finish();
  }

  mounted() {
    this.fridgeSetting = this.defaultTemp();
    this.beerSetting = this.defaultTemp();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <big>Settings</big>
      </q-item>
      <q-item dark>
        <q-item-section>Initial Fridge temperature</q-item-section>
        <q-item-section>
          <UnitField v-model="fridgeSetting" title="Fridge setting"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Initial Beer temperature</q-item-section>
        <q-item-section>
          <UnitField v-model="beerSetting" title="Beer setting"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn unelevated label="Done" color="primary" class="full-width" @click="done"/>
    </q-card-actions>
  </div>
</template>
