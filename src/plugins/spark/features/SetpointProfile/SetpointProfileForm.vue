<script lang="ts">
import parseDuration from 'parse-duration';
import { Component } from 'vue-property-decorator';

import { durationString, objectSorter } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';

import { Setpoint, SetpointProfileBlock } from './types';

interface DisplaySetpoint {
  offsetMs: number;
  absTimeMs: number;
  temperature: Unit;
}

@Component
export default class SetpointProfileForm extends BlockCrudComponent {
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

  addPoint() {
    const newPoint = this.points.length > 0
      ? deepCopy(this.points[this.points.length - 1])
      : this.defaultPoint();
    this.points.push(newPoint);
    this.savePoints();
  }

  removePoint(index: number) {
    this.points.splice(index, 1);
    this.savePoints();
  }

  updateStartTime(startDate: Date) {
    this.block.data.start = startDate.getTime() / 1000;
    this.saveBlock();
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
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />
    <q-card-section>
      <BlockEnableToggle
        v-if="block.data.targetId.id !== null"
        :crud="crud"
        :text-enabled="`Profile is enabled and driving ${block.data.targetId}.`"
        :text-disabled="`Profile is disabled: ${block.data.targetId} will not be changed.`"
      />
      <q-separator v-if="block.data.targetId.id !== null" dark />
      <q-item dark class="q-py-md">
        <q-item-section>
          <q-item-label caption>
            Start time
          </q-item-label>
          <DatetimeField
            :value="start"
            label="Start time"
            title="Start time"
            message-html="This will shift all points.
              <br>Offset time will remain the same, absolute time values will change.
              <br>The offset for the first point is always 0s."
            @input="updateStartTime"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Driven Setpoint/Sensor pair
          </q-item-label>
          <LinkField
            :value="block.data.targetId"
            :service-id="serviceId"
            label="target"
            title="Driven Setpoint/Sensor pair"
            @input="v => { block.data.targetId = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
      <q-separator dark />

      <!-- Headers -->
      <q-item dark class="q-pt-md">
        <q-item-section class="col-3 q-py-none">
          <q-item-label caption>
            Offset from start
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-5 q-py-none">
          <q-item-label caption>
            Time
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-3 q-py-none">
          <q-item-label caption>
            Temperature
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-1 q-py-none" side />
      </q-item>

      <!-- Points -->
      <q-item v-for="(point, idx) in points" :key="idx" dark dense>
        <q-item-section class="col-3">
          <InputField
            :value="durationString(point.offsetMs)"
            title="Offset from start time"
            label="point offset"
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
            label="point time"
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
            label="point temperature"
            @input="v => { point.temperature = v; savePoints(); }"
          />
        </q-item-section>
        <q-item-section class="col-1" side>
          <q-btn flat dense icon="delete" @click="removePoint(idx)">
            <q-tooltip>Remove point</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>

      <!-- Add point button -->
      <q-item dark dense>
        <!-- Use multiple elements to also natively get padding -->
        <q-item-section class="col-3" />
        <q-item-section class="col-5" />
        <q-item-section class="col-3" />
        <q-item-section class="col-1" side>
          <q-btn flat dense icon="add" @click="addPoint">
            <q-tooltip>Add point</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
