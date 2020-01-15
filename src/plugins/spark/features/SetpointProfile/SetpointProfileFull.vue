<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString, objectSorter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { Unit } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';

import { profileGraphProps } from './helpers';
import { Setpoint, SetpointProfileBlock } from './types';

interface DisplaySetpoint {
  offsetMs: number;
  absTimeMs: number;
  temperature: Unit;
}

@Component
export default class SetpointProfileFull
  extends BlockCrudComponent<SetpointProfileBlock> {
  durationString = durationString;
  durationMs = durationMs;
  defaultTempValues = { degC: 20, degF: 68, degK: 293 };

  get tempUnit(): string {
    return sparkStore.units(this.block.serviceId).Temp;
  }

  get start(): number {
    return (this.block.data.start || 0) * 1000;
  }

  get points(): DisplaySetpoint[] {
    return [...this.block.data.points]
      .sort(objectSorter('time'))
      .map((point: Setpoint) => ({
        offsetMs: point.time * 1000,
        absTimeMs: this.start + (point.time * 1000),
        temperature: point.temperature,
      }));
  }

  get graphProps(): any {
    return profileGraphProps(this.block);
  }

  savePoints(points: DisplaySetpoint[] = this.points): void {
    this.block.data.points = [...points]
      .sort(objectSorter('offsetMs'))
      .map((point: DisplaySetpoint) => ({
        time: point.offsetMs / 1000,
        temperature: point.temperature,
      }));
    this.saveBlock();
  }

  defaultPoint(): DisplaySetpoint {
    return {
      offsetMs: 0,
      absTimeMs: new Date(this.start).getTime(),
      temperature: new Unit(this.defaultTempValues[this.tempUnit] || 20, this.tempUnit),
    };
  }

  addPoint(): void {
    const newPoint = this.points.length > 0
      ? deepCopy(this.points[this.points.length - 1])
      : this.defaultPoint();
    this.points.push(newPoint);
    this.savePoints();
  }

  removePoint(index: number): void {
    this.points.splice(index, 1);
    this.savePoints();
  }

  updateStartTime(startDate: Date): void {
    this.block.data.start = startDate.getTime() / 1000;
    this.saveBlock();
  }

  notifyInvalidTime(): void {
    notify.warn('Point time must be later than start time', { logged: false });
  }

  intermediateTemp(points: DisplaySetpoint[], dateMs: number): Unit | null {
    const nextIdx = points.findIndex(point => point.absTimeMs >= dateMs);
    if (nextIdx < 1) { return null; }

    const prev = points[nextIdx - 1];
    const next = points[nextIdx];
    const prevVal = prev.temperature.value as number;
    const nextVal = next.temperature.value as number;
    const duration = (next.absTimeMs - prev.absTimeMs) || 1;
    const interpolated = prevVal + (dateMs - prev.absTimeMs) * (nextVal - prevVal) / duration;
    return prev.temperature.copy(interpolated);
  }

  splicePoints(index, ...items: DisplaySetpoint[]): void {
    this.points.splice(index, 1, ...items);
    this.savePoints();
  }

  changePoint(index: number, changed: DisplaySetpoint): void {
    const now = new Date().getTime();

    // Check if temp is currently managed by profile
    if (this.block.data.enabled
      && this.block.data.targetId.id
      && this.points.length >= 2
      && this.points[0].absTimeMs < now
      && this.points[this.points.length - 1].absTimeMs > now
    ) {
      const copy = deepCopy(this.points);
      copy[index] = changed;

      const current = this.intermediateTemp(this.points, now);
      const projected = this.intermediateTemp(copy, now);

      // Check if this change would cause a jump in target setting
      if (current !== null
        && projected !== null
        && current.roundedValue !== projected.roundedValue) {

        const pinned: DisplaySetpoint = {
          offsetMs: now - this.start,
          absTimeMs: now,
          temperature: current,
        };

        const [first, second] = [pinned, changed].sort(objectSorter('absTimeMs'));

        createDialog({
          title: 'Insert point',
          message: `
          Do you want to insert an extra point to prevent an instant jump
          from <b>${current}</b> to <b>${projected}</b>?`,
          html: true,
          cancel: 'No',
          ok: 'Yes',
          persistent: true,
        })
          .onOk(() => this.splicePoints(index, first, second))
          .onCancel(() => this.splicePoints(index, changed));

        // Insert is now handled in createDialog callbacks
        return;
      }
    }

    // Default behaviour: only insert changed point
    this.splicePoints(index, changed);
  }

  updatePointTime(index: number, date: Date): void {
    const absTimeMs = date.getTime();
    if (absTimeMs < this.start) {
      this.notifyInvalidTime();
    }
    else {
      this.changePoint(index, {
        absTimeMs,
        temperature: this.points[index].temperature,
        offsetMs: absTimeMs - this.start,
      });
    }
  }

  updatePointOffset(index: number, offsetMs: number): void {
    if (offsetMs < 0) {
      this.notifyInvalidTime();
    }
    else {
      this.changePoint(index, {
        offsetMs,
        temperature: this.points[index].temperature,
        absTimeMs: this.start + offsetMs,
      });
    }
  }

  updatePointTemperature(index: number, value: Unit): void {
    this.changePoint(index, {
      ...this.points[index],
      temperature: value,
    });
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings">
      <BlockEnableToggle
        v-if="block.data.targetId.id !== null"
        :crud="crud"
        :text-enabled="`Profile is enabled and driving ${block.data.targetId}.`"
        :text-disabled="`Profile is disabled: ${block.data.targetId} will not be changed.`"
      />
    </slot>
    <q-card-section>
      <q-separator v-if="block.data.targetId.id !== null" />
      <q-item class="q-py-md">
        <q-item-section class="self-end">
          <DatetimeField
            :value="start"
            :html="true"
            label="Start time"
            title="Start time"
            message="This will shift all points.
              <br>Offset time will remain the same, absolute time values will change.
              <br>The offset for the first point is always 0s."
            @input="updateStartTime"
          />
        </q-item-section>
        <q-item-section class="self-end">
          <BlockField
            :value="block.data.targetId"
            :service-id="serviceId"
            label="Driven Setpoint"
            title="Driven Setpoint/Sensor pair"
            @input="v => { block.data.targetId = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
      <q-separator />


      <div class="q-mx-sm q-mt-md">
        <div
          v-for="(point, idx) in points"
          :key="idx"
          class="grid-container"
        >
          <div style="grid-column-end: span 2" class="self-end">
            <DurationInputField
              :value="durationString(point.offsetMs)"
              :html="true"
              title="Offset from start time"
              label="Offset"
              message="
            This will change the point offset.
              <br>The absolute point time will be changed to start time + offset.
              <br>Changing point offset may change point order.
            "
              @input="v => updatePointOffset(idx, durationMs(v))"
            />
          </div>
          <div style="grid-column-end: span 4" class="self-end">
            <DatetimeField
              :value="point.absTimeMs"
              :html="true"
              title="Time"
              label="Time"
              message="
              This will change the absolute point time.
              <br>Changing point time may change point order.
              <br>Point offset is changed to point time - start time.
              "
              @input="v => updatePointTime(idx, v)"
            />
          </div>
          <div style="grid-column-end: span 3" class="self-end">
            <UnitField
              :value="point.temperature"
              title="Temperature"
              label="Temperature"
              @input="v => updatePointTemperature(idx, v)"
            />
          </div>
          <div style="grid-column-end: / span 1" class="column justify-end self-end">
            <q-btn flat dense class="darkish col-auto" icon="delete" @click="removePoint(idx)">
              <q-tooltip>Remove point</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="row justify-end q-mt-md">
          <q-btn round outline icon="add" @click="addPoint">
            <q-tooltip>Add point</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-row-gap: 10px;
  grid-column-gap: 5px;
}
</style>
