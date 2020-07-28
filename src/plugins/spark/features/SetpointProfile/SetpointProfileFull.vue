<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString, objectSorter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { Qty,Temp } from '@/plugins/spark/bloxfield';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { deepCopy } from '@/plugins/spark/parse-object';
import { Setpoint, SetpointProfileBlock } from '@/plugins/spark/types';

import { profileGraphProps } from './helpers';

interface DisplaySetpoint {
  offsetMs: number;
  absTimeMs: number;
  temperature: Qty;
}

@Component
export default class SetpointProfileFull
  extends BlockCrudComponent<SetpointProfileBlock> {
  durationString = durationString;
  durationMs = durationMs;

  get tempUnit(): string {
    return this.sparkModule.units.Temp;
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
      temperature: new Temp(20, 'degC').convert(this.tempUnit),
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

  intermediateTemp(points: DisplaySetpoint[], dateMs: number): Qty | null {
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

  updatePointTemperature(index: number, value: Qty): void {
    this.changePoint(index, {
      ...this.points[index],
      temperature: value,
    });
  }
}
</script>

<template>
  <div class="widget-lg">
    <slot name="warnings">
      <BlockEnableToggle
        v-if="block.data.targetId.id !== null"
        :crud="crud"
        :text-enabled="`Profile is enabled and driving ${block.data.targetId}.`"
        :text-disabled="`Profile is disabled: ${block.data.targetId} will not be changed.`"
      />
    </slot>

    <div class="q-ma-md row q-gutter-xs">
      <DatetimeField
        :value="start"
        label="Start time"
        title="Start time"
        html
        message="
          This will shift all points.
          <br>Offset time will remain the same, absolute time values will change.
          <br>The offset for the first point is always 0s."
        class="col-grow"
        @input="updateStartTime"
      />
      <LinkField
        :value="block.data.targetId"
        :service-id="serviceId"
        label="Driven Setpoint"
        title="Driven Setpoint/Sensor pair"
        class="col-grow"
        @input="v => { block.data.targetId = v; saveBlock(); }"
      />

      <div class="col-break" />

      <div
        v-for="(point, idx) in points"
        :key="idx"
        class="col-12 row q-gutter-xs q-mt-none profile-point"
      >
        <DurationInputField
          :value="durationString(point.offsetMs)"
          title="Offset from start time"
          label="Offset"
          html
          message="
            This will change the point offset.
            <br>The absolute point time will be changed to start time + offset.
            <br>Changing point offset may change point order."
          class="col min-width-sm"
          @input="v => updatePointOffset(idx, durationMs(v))"
        />
        <DatetimeField
          :value="point.absTimeMs"
          title="Time"
          label="Time"
          html
          message="
            This will change the absolute point time.
            <br>Changing point time may change point order.
            <br>Point offset is changed to point time - start time."
          class="col min-width-sm"
          @input="v => updatePointTime(idx, v)"
        />
        <UnitField
          :value="point.temperature"
          title="Temperature"
          label="Temperature"
          class="col min-width-sm"
          @input="v => updatePointTemperature(idx, v)"
        />
        <q-btn
          flat
          dense
          round
          class="darkish col-auto self-center"
          icon="delete"
          @click="removePoint(idx)"
        >
          <q-tooltip>Remove point</q-tooltip>
        </q-btn>
      </div>

      <div class="col-break" />

      <div class="col row justify-end q-mt-sm">
        <q-btn fab-mini icon="add" color="indigo-4" @click="addPoint">
          <q-tooltip>Add point</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>


<style lang="sass" scoped>
.profile-point:nth-child(even) > label
  background: rgba($green-5, 0.05)

.profile-point:nth-child(odd) > label
  background: rgba($blue-5, 0.05)
</style>
