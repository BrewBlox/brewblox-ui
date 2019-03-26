<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit, Link } from '@/helpers/units';
import parseDuration from 'parse-duration';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/state';
import { renameBlock, createBlock, saveBlock } from '@/plugins/spark/store/actions';
import { createDashboard, appendDashboardItem } from '@/store/dashboards/actions';
import { widgetSizeById } from '@/store/features/getters';
import { RootStore } from '@/store/state';
import { typeName as pinType } from '@/plugins/spark/features/ActuatorPin/getters';
import { typeName as spProfileType } from '@/plugins/spark/features/SetpointProfile/getters';
import { typeName as spSimpleType } from '@/plugins/spark/features/SetpointSimple/getters';
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
  fridgeSetpointValue = new Unit(20, 'degC');
  beerSetpointValue = new Unit(20, 'degC');

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  defineCreatedBlocks() {
    this.cfg.createdBlocks = [
      // setpoint
      {
        id: this.cfg.names.fridgeSetpoint,
        serviceId: this.cfg.serviceId,
        type: spSimpleType,
        groups: this.cfg.groups,
        data: {
          enabled: true,
          setpoint: this.fridgeSetpointValue,
        },
      },
      {
        id: this.cfg.names.beerSetpoint,
        serviceId: this.cfg.serviceId,
        type: spProfileType,
        groups: this.cfg.groups,
        data: {
          points: [
            {
              time: new Date().getTime() / 1000,
              'temperature[degC]': this.beerSetpointValue.value,
            },
            {
              time: (new Date().getTime() + parseDuration('2w')) / 1000,
              'temperature[degC]': this.beerSetpointValue.value,
            },
          ],
        },
      },
      // setpoint sensor pair
      {
        id: this.cfg.names.fridgeSSPair,
        serviceId: this.cfg.serviceId,
        type: pairType,
        groups: this.cfg.groups,
        data: {
          setpointId: new Link(this.cfg.names.fridgeSetpoint),
          sensorId: new Link(this.cfg.names.fridgeSensor),
        },
      },
      {
        id: this.cfg.names.beerSSPair,
        serviceId: this.cfg.serviceId,
        type: pairType,
        groups: this.cfg.groups,
        data: {
          setpointId: new Link(this.cfg.names.beerSetpoint),
          sensorId: new Link(this.cfg.names.beerSensor),
        },
      },
      // PWM
      {
        id: this.cfg.names.coolPwm,
        serviceId: this.cfg.serviceId,
        type: pwmType,
        groups: this.cfg.groups,
        data: {
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
          enabled: true,
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
        type: pinType,
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
        type: pinType,
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

  sensorType(newId: string): string {
    for (let [from, to] of Object.entries(this.cfg.renamedBlocks)) {
      if (to === newId) {
        return blockById(this.$store, this.cfg.serviceId, from).type;
      }
    }
    throw new Error('Old sensor not found');
  }

  defineWidgets() {
    const genericSettings = {
      dashboard: this.cfg.dashboardId,
      cols: 4,
      rows: 4,
      order: 0,
    };

    const sensorTypes = {
      fridge: this.sensorType(this.cfg.names.fridgeSensor),
      beer: this.sensorType(this.cfg.names.beerSensor),
    };

    const createWidget =
      (id: string, type: string) => ({
        ...genericSettings,
        ...widgetSizeById(this.$store, type),
        id: id,
        feature: type,
        config: {
          blockId: id,
          serviceId: this.cfg.serviceId,
        },
      });

    this.cfg.widgets = [
      // PID
      createWidget(this.cfg.names.coolPid, pidType),
      createWidget(this.cfg.names.heatPid, pidType),
      createWidget(this.cfg.names.beerPid, pidType),
      // Setpoints
      createWidget(this.cfg.names.fridgeSetpoint, spSimpleType),
      createWidget(this.cfg.names.beerSetpoint, spProfileType),
      // Sensors
      createWidget(this.cfg.names.fridgeSensor, sensorTypes.fridge),
      createWidget(this.cfg.names.beerSensor, sensorTypes.beer),
      // SSPairs are skipped
      // Pins
      createWidget(this.cfg.names.coolPin, pinType),
      createWidget(this.cfg.names.heatPin, pinType),
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
        <q-item-section>Fridge temperature</q-item-section>
        <q-item-section>
          <UnitPopupEdit
            :field="fridgeSetpointValue"
            :change="v => fridgeSetpointValue = v"
            label="Fridge temperature"
            tag="span"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Beer temperature</q-item-section>
        <q-item-section>
          <UnitPopupEdit
            :field="beerSetpointValue"
            :change="v => beerSetpointValue = v"
            label="Beer temperature"
            tag="span"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn unelevated label="Done" color="primary" class="full-width" @click="done"/>
    </q-card-actions>

    <q-card v-if="false" dark>
      <q-card-actions>
        <q-btn label="Done" color="primary" @click="done"/>
      </q-card-actions>
      <q-card-main class="row">
        <div>
          <q-list no-border>
            <q-item dark>
              <big>Settings</big>
            </q-item>
            <q-item dark>
              <q-field label="Fridge temperature" orientation="vertical" style="max-width: 200px;">
                <UnitPopupEdit
                  :field="fridgeSetpointValue"
                  :change="v => fridgeSetpointValue = v"
                  label="Fridge temperature"
                  tag="span"
                />
              </q-field>
            </q-item>
            <q-item dark>
              <q-field label="Beer temperature" orientation="vertical" style="max-width: 200px;">
                <UnitPopupEdit
                  :field="beerSetpointValue"
                  :change="v => beerSetpointValue = v"
                  label="Beer temperature"
                  tag="span"
                />
              </q-field>
            </q-item>
          </q-list>
        </div>
      </q-card-main>
    </q-card>
  </div>
</template>
