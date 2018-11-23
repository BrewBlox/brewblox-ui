<script lang="ts">
import { durationString, objectSorter } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { units } from '@/plugins/spark/store/getters';
import parseDuration from 'parse-duration';
import Component from 'vue-class-component';
import { Setpoint, SetpointProfileBlock } from './state';

interface OffsetPoint {
  time: number;
  temperature: Unit;
  offsetMs: number;
}

@Component
export default class SetpointProfileForm extends BlockForm {
  get block() {
    return this.blockField as SetpointProfileBlock;
  }

  get tempUnit() {
    return units(this.$store, this.block.serviceId).Temp;
  }

  get points(): OffsetPoint[] {
    return this.block.data.points
      .sort(objectSorter('time'))
      .map((point: Setpoint, idx: number, arr: Setpoint[]) => ({
        time: new Date(point.time * 1000).getTime(),
        temperature: point.temperature,
        offsetMs: (idx > 0 ? ((point.time - arr[0].time) * 1000) : 0),
      }));
  }

  get start(): number {
    return (this.points.length > 0
      ? this.points[0].time
      : new Date().getTime());
  }

  defaultData() {
    return {
      points: [],
    };
  }

  savePoints(points: OffsetPoint[] = this.points) {
    this.block.data.points = points
      .sort(objectSorter('time'))
      .map(offsetPoint => ({
        time: (offsetPoint.time / 1000),
        temperature: offsetPoint.temperature,
      }));
    this.saveBlock();
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
    const newPoints = this.points.length > 0
      ? [...this.points, this.copyPoint(this.points[this.points.length - 1])]
      : [...this.points, this.defaultPoint()];
    this.savePoints(newPoints);
  }

  removePoint(index: number) {
    this.savePoints(this.points.filter((_: any, idx: number) => idx !== index));
  }

  updateStartTime(startTime: number) {
    const newPoints = this.points.length > 0
      ? this.points
        .map((offset: OffsetPoint, idx: number) => ({
          ...offset,
          time: (idx === 0 ? startTime : new Date(startTime + offset.offsetMs).getTime()),
        }))
      : [this.defaultPoint()];
    this.savePoints(newPoints);
  }

  updatePointTime(index: number, time: number) {
    this.points[index] = {
      time,
      temperature: this.points[index].temperature,
      offsetMs: time - this.start,
    };
    this.savePoints();
  }

  updatePointOffset(index: number, offsetMs: number) {
    this.points[index] = {
      offsetMs,
      temperature: this.points[index].temperature,
      time: new Date(this.start + offsetMs).getTime(),
    };
    this.savePoints();
  }

  updatePointTemperature(index: number, temp: Unit) {
    this.points[index].temperature = temp;
    this.savePoints();
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
  <div class="widget-modal">
    <q-card>
      <q-card-title>Setpoints</q-card-title>
      <q-card-main>
        <q-field class="col" label="Start time" orientation="vertical">
          <DatetimePopupEdit
            label="Start time"
            display="big"
            :field="start"
            :change="updateStartTime"
          />
        </q-field>
        <q-field class="col" label="Points" orientation="vertical">
          <div v-for="(point, idx) in points" :key="idx" class="row justify-around">
            <q-field label="Offset" orientation="vertical">
              <InputPopupEdit
                label="Offset from start"
                :field="durationString(point.offsetMs)"
                :change="v => updatePointOffset(idx, parseDuration(v))"
              />
            </q-field>
            <q-field label="Time" orientation="vertical">
              <DatetimePopupEdit
                label="Time"
                display="big"
                :field="point.time"
                :change="v => updatePointTime(idx, v)"
              />
            </q-field>
            <q-field label="Temperature" orientation="vertical">
              <UnitPopupEdit
                label="Temperature"
                :field="point.temperature"
                :change="v => updatePointTemperature(idx, v)"
              />
            </q-field>
            <q-field label=" " orientation="vertical">
              <q-btn flat round dense icon="delete" @click="removePoint(idx)"/>
            </q-field>
          </div>
        </q-field>
        <q-field>
          <q-btn icon="add" label="Add point" @click="addPoint"/>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit label="Block ID" :field="block.id" :change="changeBlockId"/>
        </q-field>
        <q-field class="col" label="Service ID">
          <big>{{ serviceId }}</big>
        </q-field>
        <q-field class="col" label="Block Type">
          <big>{{ block.type }}</big>
        </q-field>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

