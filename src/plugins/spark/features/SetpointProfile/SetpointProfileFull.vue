<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString, objectSorter } from '@/helpers/functional';
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
export default class SetpointProfileFull extends BlockCrudComponent {
  durationString = durationString;
  durationMs = durationMs;
  defaultTempValues = { degC: 20, degF: 68, degK: 293 };

  readonly block!: SetpointProfileBlock;

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
    this.$q.notify({
      icon: 'error',
      color: 'negative',
      message: 'Point time must be later than start time',
    });
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
          Insert a point at current time and setting?
          This prevents instant jumps in temperature setting.`,
          cancel: 'No',
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
  <q-card dark v-bind="$attrs">
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
          <DurationInputField
            :value="durationString(point.offsetMs)"
            title="Offset from start time"
            label="point offset"
            message-html="
            This will change the point offset.
              <br>The absolute point time will be changed to start time + offset.
              <br>Changing point offset may change point order.
            "
            @input="v => updatePointOffset(idx, durationMs(v))"
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
            @input="v => updatePointTemperature(idx, v)"
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
