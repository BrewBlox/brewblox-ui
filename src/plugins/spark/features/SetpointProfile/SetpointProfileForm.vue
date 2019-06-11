<script lang="ts">
import parseDuration from 'parse-duration';
import { Component } from 'vue-property-decorator';

import { durationString, objectSorter } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import sparkStore from '@/plugins/spark/store';

import { Setpoint, SetpointProfileBlock } from './types';

interface DisplaySetpoint {
  offsetMs: number;
  absTimeMs: number;
  temperature: Unit;
}

@Component
export default class SetpointProfileForm extends BlockForm {
  durationString = durationString;
  parseDuration = parseDuration;

  readonly block!: SetpointProfileBlock;

  get tempUnit() {
    return sparkStore.units(this.block.serviceId).Temp;
  }

  get start(): number {
    return (this.block.data.start || 0) * 1000;
  }

  get points(): DisplaySetpoint[] {
    return this.block.data.points
      .sort(objectSorter('time'))
      .map((point: Setpoint) => ({
        offsetMs: point.time * 1000,
        absTimeMs: this.start + (point.time * 1000),
        temperature: point.temperature,
      }));
  }

  savePoints(points: DisplaySetpoint[] = this.points) {
    this.block.data.points = points
      .sort(objectSorter('offsetMs'))
      .map((point: DisplaySetpoint) => ({
        time: point.offsetMs / 1000,
        temperature: point.temperature,
      }));
    this.saveBlock();
  }

  defaultPoint(): DisplaySetpoint {
    const defaultTempValues = { degC: 20, degF: 68, degK: 293 };
    return {
      offsetMs: 0,
      absTimeMs: new Date(this.start).getTime(),
      temperature: new Unit(defaultTempValues[this.tempUnit] || 20, this.tempUnit),
    };
  }

  copyPoint(point: DisplaySetpoint): DisplaySetpoint {
    return {
      ...point,
      temperature: new Unit(point.temperature.value, point.temperature.unit),
    };
  }

  addPoint() {
    const newPoints = this.points.length > 0
      ? [...this.points, this.copyPoint(this.points[this.points.length - 1])]
      : [this.defaultPoint()];
    this.savePoints(newPoints);
  }

  removePoint(index: number) {
    this.savePoints(this.points.filter((_: any, idx: number) => idx !== index));
  }

  updateStartTime(startDate: Date) {
    const startTime = startDate.getTime();
    this.block.data.start = startTime / 1000;
    const newPoints = this.points
      .map((point: DisplaySetpoint) => ({
        ...point,
        absTimeMs: startTime + point.offsetMs,
      }));
    this.savePoints(newPoints);
  }

  notifyInvalidTime() {
    this.$q.notify({
      icon: 'error',
      color: 'negative',
      message: 'Point time must be later than start time',
    });
  }

  updatePointTime(index: number, date: Date) {
    const absTimeMs = date.getTime();
    if (absTimeMs < this.start) {
      this.notifyInvalidTime();
      return;
    }
    this.points[index] = {
      absTimeMs,
      temperature: this.points[index].temperature,
      offsetMs: absTimeMs - this.start,
    };
    this.savePoints();
  }

  updatePointOffset(index: number, offsetMs: number) {
    if (offsetMs < 0) {
      this.notifyInvalidTime();
      return;
    }
    this.points[index] = {
      offsetMs,
      temperature: this.points[index].temperature,
      absTimeMs: this.start + offsetMs,
    };
    this.savePoints();
  }

  updatePointTemperature(index: number, temp: Unit) {
    this.points[index].temperature = temp;
    this.savePoints();
  }

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-if="block.data.targetId.id !== null"
          v-bind="$props"
          :text-enabled="`Profile is enabled: ${block.data.targetId} will be set by the profile.`"
          :text-disabled="`Profile is disabled: ${block.data.targetId} will not be changed.`"
        />
        <q-separator v-if="block.data.targetId.id !== null" dark/>
        <q-item dark class="q-py-md">
          <q-item-section>
            <q-item-label caption>Start time</q-item-label>
            <DatetimeField
              :value="start"
              title="Start time"
              message-html="This will shift all points.
              <br>Offset time will remain the same, absolute time values will change.
              <br>The offset for the first point is always 0s."
              @input="updateStartTime"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Driven Setpoint/Sensor pair</q-item-label>
            <LinkField
              :value="block.data.targetId"
              :service-id="serviceId"
              title="Driven Setpoint/Sensor pair"
              @input="v => { block.data.targetId = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-separator dark/>

        <q-item dark class="q-pt-md">
          <q-item-section class="col-3 q-py-none">
            <q-item-label caption>Offset from first</q-item-label>
          </q-item-section>
          <q-item-section class="col-5 q-py-none">
            <q-item-label caption>Time</q-item-label>
          </q-item-section>
          <q-item-section class="col-3 q-py-none">
            <q-item-label caption>Temperature</q-item-label>
          </q-item-section>
          <q-item-section class="col-1 q-py-none" side/>
        </q-item>
        <q-item v-for="(point, idx) in points" :key="idx" dark dense>
          <q-item-section class="col-3">
            <InputField
              :value="durationString(point.offsetMs)"
              title="Offset from start time"
              message-html="
            This will change the point offset.
              <br>The absolute point time will be changed to start time + offset.
              <br>Changing point offset may change point order.
            "
              @input="v => updatePointOffset(idx, parseDuration(v))"
            />
          </q-item-section>
          <q-item-section class="col-5">
            <DatetimeField
              :value="point.absTimeMs"
              title="Time"
              message-html="
              This will change the absolute point time.
              <br>Changing point time may change point order.
              <br>Point offset is changed to point time - start time.
              "
              @input="v => updatePointTime(idx, v)"
            />
          </q-item-section>
          <q-item-section class="col-3">
            <UnitField
              :value="point.temperature"
              title="Temperature"
              @input="v => updatePointTemperature(idx, v)"
            />
          </q-item-section>
          <q-item-section class="col-1" side>
            <q-btn flat round dense icon="delete" @click="removePoint(idx)"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn flat icon="add" label="Add point" @click="addPoint"/>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
