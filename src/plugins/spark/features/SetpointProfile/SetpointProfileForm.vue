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

  presets() {
    return [
      {
        label: 'Default',
        value: {
          points: [],
          setting: new Unit(0, 'degC'),
          enabled: true,
        },
      },
    ];
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
  <div class="widget-modal column">
    <q-toolbar v-if="$props.buttons" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="settings" label="Settings">
      <div>
        <q-field label="Enabled">
          <q-toggle
            :value="block.data.enabled"
            @input="v => { block.data.enabled = v; saveBlock(); }"
          />
        </q-field>
        <q-field label="Current setting">
          <big>{{ block.data.setting | unit }}</big>
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-thermometer" label="Setpoints">
      <div>
        <q-field class="col" label="Start time" orientation="vertical">
          <DatetimePopupEdit
            :field="start"
            :change="updateStartTime"
            label="Start time"
            display="big"
          />
        </q-field>
        <q-field class="col" label="Points" orientation="vertical">
          <div v-for="(point, idx) in points" :key="idx" class="row justify-around">
            <q-field label="Offset" orientation="vertical">
              <InputPopupEdit
                :field="durationString(point.offsetMs)"
                :change="v => updatePointOffset(idx, parseDuration(v))"
                label="Offset from start"
              />
            </q-field>
            <q-field label="Time" orientation="vertical">
              <DatetimePopupEdit
                :field="point.time"
                :change="v => updatePointTime(idx, v)"
                label="Time"
                display="big"
              />
            </q-field>
            <q-field label="Temperature" orientation="vertical">
              <UnitPopupEdit
                :field="point.temperature"
                :change="v => updatePointTemperature(idx, v)"
                label="Temperature"
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
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
