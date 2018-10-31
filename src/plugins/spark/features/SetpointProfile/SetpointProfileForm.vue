<script lang="ts">
import Component from 'vue-class-component';
import parseDuration from 'parse-duration';
import { objectSorter, durationString } from '@/helpers/functional';
import { deepCopy } from '@/helpers/shadow-copy';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { units } from '@/plugins/spark/store/getters';
import { Unit } from '@/helpers/units';
import { Setpoint } from './state';

interface OffsetPoint {
  time: number;
  temperature: Unit;
  offsetMs: number;
}

@Component
export default class SetpointProfileForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      points: { path: 'data.points', default: [] },
    };
  }

  get tempUnit() {
    return units(this.$store, this.block.serviceId).Temp;
  }

  get points() {
    return this.inputValues.points
      .sort(objectSorter('time'))
      .map((point: Setpoint, idx: number, arr: Setpoint[]) => ({
        time: new Date(point.time * 1000).getTime(),
        temperature: point.temperature,
        offsetMs: (idx > 0 ? ((point.time - arr[0].time) * 1000) : 0),
      }));
  }

  set points(points: OffsetPoint[]) {
    this.inputValues.points = points
      .map(offsetPoint => ({
        time: (offsetPoint.time / 1000),
        temperature: offsetPoint.temperature,
      }));
  }

  get start(): number {
    return (this.points.length > 0
      ? this.points[0].time
      : new Date().getTime());
  }

  set start(startTime: number) {
    // console.log(date);
    // console.log(date instanceof Date);
    if (this.points.length > 0) {
      this.points = this.points
        .map((offset: OffsetPoint, idx: number) => ({
          ...offset,
          time: (idx === 0 ? startTime : new Date(startTime + offset.offsetMs).getTime()),
        }));
    } else {
      this.points = [this.defaultPoint()];
    }
  }

  defaultPoint() {
    return {
      time: new Date().getTime(),
      temperature: new Unit(0, this.tempUnit),
      offsetMs: 0,
    };
  }

  copyPoint(point: OffsetPoint) {
    return {
      time: point.time,
      temperature: new Unit(point.temperature.value, point.temperature.unit),
      offsetMs: point.offsetMs,
    };
  }

  addPoint() {
    if (this.points.length > 0) {
      this.points = [...this.points, this.copyPoint(this.points[this.points.length - 1])];
    } else {
      this.points = [...this.points, this.defaultPoint()];
    }
  }

  removePoint(index: number) {
    this.points = this.points.filter((_: any, idx: number) => idx !== index);
  }

  updatePointTime(index: number, time: number) {
    this.points = this.points
      .map((point: OffsetPoint, idx: number) =>
        (idx !== index
          ? point
          : {
            time,
            temperature: this.points[index].temperature,
            offsetMs: time - this.start,
          }));
  }

  updatePointOffset(index: number, offsetMs: number) {
    this.points = this.points
      .map((point: OffsetPoint, idx: number) =>
        (idx !== index
          ? point
          : {
            offsetMs,
            temperature: this.points[index].temperature,
            time: new Date(this.start + offsetMs).getTime(),
          }));
  }

  durationString(valMs: number) {
    return durationString(valMs);
  }

  parseDuration(val: string) {
    return parseDuration(val);
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <widget-field
        label="Start time"
      >

        <q-datetime
          dark
          format24h
          no-parent-field
          stack-label="Time"
          type="datetime"
          v-model="start"
          :disabled="points.length === 0"
          :after="[
            {
              icon: 'restore',
              handler: () => { start = new Date().getTime(); },
            }
          ]"
        />

      </widget-field>

      <widget-field>
        <div
          v-for="(point, idx) in points"
          :key="idx"
          class="row items-end"
        >

          <q-input
            stack-label="Offset from start"
            :disabled="idx === 0"
            :value="durationString(point.offsetMs)"
            @change="v => updatePointOffset(idx, parseDuration(v))"
          />

          <q-icon name="add" />

          <!--
          Notes:
          - Change is triggered on blur to prevent firing when offset is changed.
          - @blur is fired with undefined after clicking the "after" button,
            and then selecting something else.
          -->
          <q-datetime
            dark
            format24h
            no-parent-field
            stack-label="Time"
            type="datetime"
            :value="point.time"
            @blur="v => v && updatePointTime(idx, v)"
            :after="[
              {
                icon: 'restore',
                handler: () => updatePointTime(idx, new Date().getTime()),
              }
            ]"
          />

          <q-icon name="chevron_right" />

          <q-input
            stack-label="Temperature"
            v-model="point.temperature.value"
            :suffix="point.temperature.unitNotation"
            type="number"
          />

          <q-btn
            flat
            round
            dense
            icon="delete"
            @click="removePoint(idx)"
          />

        </div>
      </widget-field>

      <widget-field>
        <q-btn
          icon="add"
          label="Add point"
          @click="addPoint"
        />
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>

