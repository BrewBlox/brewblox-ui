<script lang="ts">
import { uid } from 'quasar';
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit, Link } from '@/helpers/units';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/state';
import { renameBlock, createBlock, saveBlock } from '@/plugins/spark/store/actions';
import { createDashboard, appendDashboardItem } from '@/store/dashboards/actions';
import { widgetSizeById } from '@/store/features/getters';
import { RootStore } from '@/store/state';
import { typeName as spProfileType } from '@/plugins/spark/features/SetpointProfile/getters';
import { typeName as pairType } from '@/plugins/spark/features/SetpointSensorPair/getters';
import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { typeName as mutexType } from '@/plugins/spark/features/Mutex/getters';
import { typeName as offsetType } from '@/plugins/spark/features/ActuatorOffset/getters';
import {
  typeName as pidType,
  defaultData as pidData,
} from '@/plugins/spark/features/Pid/getters';
import { dashboardIds } from '@/store/dashboards/getters';
import { blockById } from '@/plugins/spark/store/getters';
import { Dashboard } from '@/store/dashboards/state';

@Component
export default class BrewPiSettingsTask extends WizardTaskBase {
  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  blockType(newId: string): string {
    for (let [from, to] of Object.entries(this.cfg.renamedBlocks)) {
      if (to === newId) {
        return blockById(this.$store, this.cfg.serviceId, from).type;
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
        id: this.cfg.names.fridgeOffset,
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
          outputId: new Link(this.cfg.names.fridgeOffset),
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
        ...widgetSizeById(this.$store, type),
        id: uid(),
        title: name,
        feature: type,
        config: {
          blockId: name,
          serviceId: this.cfg.serviceId,
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
      createWidget(this.cfg.names.fridgeOffset, offsetType),

    ];
  }

  defineActions() {
    this.pushActions([
      async (store: RootStore, cfg: BrewPiConfig): Promise<void> => {
        await Promise.all(
          Object.entries(cfg.renamedBlocks)
            .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
            .map(
              ([currVal, newVal]: [string, string]) =>
                renameBlock(store, cfg.serviceId, currVal, newVal)));
      },

      async (store: RootStore, cfg: BrewPiConfig): Promise<void> => {
        // Create synchronously, to ensure dependencies are created first
        for (let block of cfg.createdBlocks) {
          await createBlock(store, cfg.serviceId, block);
        }
      },

      async (store: RootStore, cfg: BrewPiConfig): Promise<void> => {
        await Promise.all(
          cfg.changedBlocks
            .map(block => saveBlock(store, cfg.serviceId, block)));
      },

      async (store: RootStore, cfg: BrewPiConfig): Promise<void> => {
        if (!dashboardIds(store).includes(cfg.dashboardId)) {
          const dashboard: Dashboard = {
            id: cfg.dashboardId,
            title: cfg.dashboardTitle,
            order: dashboardIds(store).length + 1,
          };
          await createDashboard(store, dashboard);
        }
        await Promise.all(
          cfg.widgets
            .map(item => appendDashboardItem(store, item)));
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
