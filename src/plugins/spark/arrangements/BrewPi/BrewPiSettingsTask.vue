<script lang="ts">
import Component from 'vue-class-component';
import dashboardStore from '@/store/dashboards';
import featureStore from '@/store/features';
import sparkStore from '@/plugins/spark/store';
import { uid } from 'quasar';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit, Link } from '@/helpers/units';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/types';
import { typeName as spProfileType } from '@/plugins/spark/features/SetpointProfile/getters';
import { typeName as pairType } from '@/plugins/spark/features/SetpointSensorPair/getters';
import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { typeName as mutexType } from '@/plugins/spark/features/Mutex/getters';
import { typeName as offsetType } from '@/plugins/spark/features/ActuatorOffset/getters';
import { typeName as graphType } from '@/plugins/history/Graph/getters';
import {
  typeName as pidType,
  defaultData as pidData,
} from '@/plugins/spark/features/Pid/getters';
import { Dashboard } from '@/store/types';

@Component
export default class BrewPiSettingsTask extends WizardTaskBase {
  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');

  get userTemp(): string {
    return sparkStore.units(this.cfg.serviceId).Temp;
  }

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  defaultTemp(): Unit {
    const defaultTempValues = { degC: 20, degF: 68, degK: 293 };
    return new Unit(defaultTempValues[this.userTemp] || 20, this.userTemp);
  }

  blockType(newId: string): string {
    for (let [from, to] of Object.entries(this.cfg.renamedBlocks)) {
      if (to === newId) {
        return sparkStore.blockById(this.cfg.serviceId, from).type;
      }
    }
    throw new Error('Old block not found');
  }

  defineCreatedBlocks() {
    this.cfg.createdBlocks = [
      // setpoint sensor pair
      {
        id: this.cfg.names.fridgeSSPair,
        serviceId: this.cfg.serviceId,
        type: pairType,
        groups: this.cfg.groups,
        data: {
          sensorId: new Link(this.cfg.names.fridgeSensor),
          setting: this.fridgeSetting,
          settingEnabled: true,
        },
      },
      {
        id: this.cfg.names.beerSSPair,
        serviceId: this.cfg.serviceId,
        type: pairType,
        groups: this.cfg.groups,
        data: {
          sensorId: new Link(this.cfg.names.beerSensor),
          setting: this.beerSetting,
          settingEnabled: true,
        },
      },
      // PWM
      {
        id: this.cfg.names.coolPwm,
        serviceId: this.cfg.serviceId,
        type: pwmType,
        groups: this.cfg.groups,
        data: {
          enabled: true,
          period: new Unit(30, 'minute'),
          actuatorId: new Link(this.cfg.names.coolPin),
        },
      },
      {
        id: this.cfg.names.heatPwm,
        serviceId: this.cfg.serviceId,
        type: pwmType,
        groups: this.cfg.groups,
        data: {
          enabled: true,
          period: new Unit(10, 'second'),
          actuatorId: new Link(this.cfg.names.heatPin),
        },
      },
      // Mutex
      {
        id: this.cfg.names.mutex,
        serviceId: this.cfg.serviceId,
        type: mutexType,
        groups: this.cfg.groups,
        data: {
          differentActuatorWait: new Unit(30, 'minute'),
        },
      },
      // Offset Actuator
      {
        id: this.cfg.names.fridgeDriver,
        serviceId: this.cfg.serviceId,
        type: offsetType,
        groups: this.cfg.groups,
        data: {
          enabled: false,
          targetId: new Link(this.cfg.names.fridgeSSPair),
          referenceId: new Link(this.cfg.names.beerSSPair),
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
        id: this.cfg.names.tempProfile,
        serviceId: this.cfg.serviceId,
        type: spProfileType,
        groups: this.cfg.groups,
        data: {
          enabled: false,
          targetId: new Link(this.cfg.names.beerSSPair),
          points: [],
        },
      },
      // PID
      {
        id: this.cfg.names.coolPid,
        serviceId: this.cfg.serviceId,
        type: pidType,
        groups: this.cfg.groups,
        data: {
          ...pidData(),
          enabled: true,
          inputId: new Link(this.cfg.names.fridgeSSPair),
          outputId: new Link(this.cfg.names.coolPwm),
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(-10, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
        },
      },
      {
        id: this.cfg.names.heatPid,
        serviceId: this.cfg.serviceId,
        type: pidType,
        groups: this.cfg.groups,
        data: {
          ...pidData(),
          enabled: true,
          inputId: new Link(this.cfg.names.fridgeSSPair),
          outputId: new Link(this.cfg.names.heatPwm),
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(20, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(3, 'minute'),
        },
      },
      {
        id: this.cfg.names.beerPid,
        serviceId: this.cfg.serviceId,
        type: pidType,
        groups: this.cfg.groups,
        data: {
          ...pidData(),
          enabled: false,
          inputId: new Link(this.cfg.names.beerSSPair),
          outputId: new Link(this.cfg.names.fridgeDriver),
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
    this.cfg.changedBlocks = [
      {
        id: this.cfg.names.coolPin,
        serviceId: this.cfg.serviceId,
        type: this.blockType(this.cfg.names.coolPin),
        groups: this.cfg.groups,
        data: {
          constrainedBy: {
            constraints: [
              { 'minOff[second]': 300 },
              { 'minOn[second]': 180 },
              { 'mutex<>': this.cfg.names.mutex },
            ],
          },
        },
      },
      {
        id: this.cfg.names.heatPin,
        serviceId: this.cfg.serviceId,
        type: this.blockType(this.cfg.names.heatPin),
        groups: this.cfg.groups,
        data: {
          constrainedBy: {
            constraints: [
              { 'mutex<>': this.cfg.names.mutex },
            ],
          },
        },
      },
    ];
  }

  defineWidgets() {
    const genericSettings = {
      dashboard: this.cfg.dashboardId,
      cols: 4,
      rows: 4,
      order: 0,
    };

    const variableTypes = {
      fridge: this.blockType(this.cfg.names.fridgeSensor),
      beer: this.blockType(this.cfg.names.beerSensor),
      coolPin: this.blockType(this.cfg.names.coolPin),
      heatPin: this.blockType(this.cfg.names.heatPin),
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
          serviceId: this.cfg.serviceId,
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
              measurement: this.cfg.serviceId,
              fields: [
                `${this.cfg.names.fridgeSSPair}/value[${this.userTemp}]`,
                `${this.cfg.names.fridgeSSPair}/setting[${this.userTemp}]`,
                `${this.cfg.names.beerSSPair}/value[${this.userTemp}]`,
                `${this.cfg.names.beerSSPair}/setting[${this.userTemp}]`,
                `${this.cfg.names.coolPwm}/value`,
                `${this.cfg.names.heatPwm}/value`,
              ],
            },
          ],
        },
      });

    this.cfg.widgets = [
      // PID
      createWidget(this.cfg.names.coolPid, pidType),
      createWidget(this.cfg.names.heatPid, pidType),
      createWidget(this.cfg.names.beerPid, pidType),
      // Setpoint profile
      createWidget(this.cfg.names.tempProfile, spProfileType),
      // Sensors
      createWidget(this.cfg.names.fridgeSensor, variableTypes.fridge),
      createWidget(this.cfg.names.beerSensor, variableTypes.beer),
      // SSPairs are skipped
      // Pins
      createWidget(this.cfg.names.coolPin, variableTypes.coolPin),
      createWidget(this.cfg.names.heatPin, variableTypes.heatPin),
      // PWMs
      createWidget(this.cfg.names.coolPwm, pwmType),
      createWidget(this.cfg.names.heatPwm, pwmType),
      // Mutex
      createWidget(this.cfg.names.mutex, mutexType),
      // Offset
      createWidget(this.cfg.names.fridgeDriver, offsetType),
      // Graph
      createGraph(this.cfg.names.graph),
    ];
  }

  defineActions() {
    this.pushActions([
      async (cfg: BrewPiConfig): Promise<void> => {
        await Promise.all(
          Object.entries(cfg.renamedBlocks)
            .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
            .map(
              ([currVal, newVal]: [string, string]) =>
                sparkStore.renameBlock([cfg.serviceId, currVal, newVal])));
      },

      async (cfg: BrewPiConfig): Promise<void> => {
        // Create synchronously, to ensure dependencies are created first
        for (let block of cfg.createdBlocks) {
          await sparkStore.createBlock([cfg.serviceId, block]);
        }
      },

      async (cfg: BrewPiConfig): Promise<void> => {
        await Promise.all(
          cfg.changedBlocks
            .map(block => sparkStore.saveBlock([cfg.serviceId, block])));
      },

      async (cfg: BrewPiConfig): Promise<void> => {
        if (!dashboardStore.dashboardIds.includes(cfg.dashboardId)) {
          const dashboard: Dashboard = {
            id: cfg.dashboardId,
            title: cfg.dashboardTitle,
            order: dashboardStore.dashboardIds.length + 1,
          };
          await dashboardStore.createDashboard(dashboard);
        }
        await Promise.all(
          cfg.widgets
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
    this.updateConfig(this.cfg);
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
          <UnitPopupEdit
            :field="fridgeSetting"
            :change="v => fridgeSetting = v"
            label="Fridge setting"
            tag="span"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Initial Beer temperature</q-item-section>
        <q-item-section>
          <UnitPopupEdit
            :field="beerSetting"
            :change="v => beerSetting = v"
            label="Beer setting"
            tag="span"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn unelevated label="Done" color="primary" class="full-width" @click="done"/>
    </q-card-actions>
  </div>
</template>
