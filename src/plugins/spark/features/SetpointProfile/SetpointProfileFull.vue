<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { Quantity, Setpoint, SetpointProfileBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { deepCopy } from '@/utils/objects';
import { bloxQty, durationMs, durationString, tempQty } from '@/utils/quantity';


interface DisplaySetpoint {
  offsetMs: number;
  absTimeMs: number;
  temperature: Quantity;
}

export default defineComponent({
  name: 'SetpointProfileFull',
  setup() {
    const {
      serviceId,
      block,
      saveBlock,
    } = useBlockWidget.setup<SetpointProfileBlock>();

    const start = computed<number>(
      () => (block.value.data.start || 0) * 1000,
    );

    const points = computed<DisplaySetpoint[]>(
      () => [...block.value.data.points]
        .sort(makeObjectSorter('time'))
        .map((point: Setpoint) => ({
          offsetMs: point.time * 1000,
          absTimeMs: start.value + (point.time * 1000),
          temperature: point.temperature,
        })),
    );

    function savePoints(pts: DisplaySetpoint[] = points.value): void {
      block.value.data.points = [...pts]
        .sort(makeObjectSorter('offsetMs'))
        .map((point: DisplaySetpoint) => ({
          time: point.offsetMs / 1000,
          temperature: point.temperature,
        }));
      saveBlock();
    }

    function defaultPoint(): DisplaySetpoint {
      return {
        offsetMs: 0,
        absTimeMs: new Date(start.value).getTime(),
        temperature: tempQty(20),
      };
    }

    function addPoint(): void {
      const newPoint = points.value.length > 0
        ? deepCopy(points.value[points.value.length - 1])
        : defaultPoint();
      points.value.push(newPoint);
      savePoints();
    }

    function removePoint(index: number): void {
      points.value.splice(index, 1);
      savePoints();
    }

    function updateStartTime(startDate: Date): void {
      block.value.data.start = startDate.getTime() / 1000;
      saveBlock();
    }

    function notifyInvalidTime(): void {
      notify.warn('Point time must be later than start time', { logged: false });
    }

    function intermediateTemp(points: DisplaySetpoint[], dateMs: number): Quantity | null {
      const nextIdx = points.findIndex(point => point.absTimeMs >= dateMs);
      if (nextIdx < 1) { return null; }

      const prev = points[nextIdx - 1];
      const next = points[nextIdx];
      const prevVal = prev.temperature.value as number;
      const nextVal = next.temperature.value as number;
      const duration = (next.absTimeMs - prev.absTimeMs) || 1;
      const interpolated = prevVal + (dateMs - prev.absTimeMs) * (nextVal - prevVal) / duration;
      return bloxQty(prev.temperature).copy(interpolated);
    }

    function splicePoints(index, ...items: DisplaySetpoint[]): void {
      points.value.splice(index, 1, ...items);
      savePoints();
    }

    function changePoint(index: number, changed: DisplaySetpoint): void {
      const now = new Date().getTime();

      // Check if temp is currently managed by profile
      if (block.value.data.enabled
        && block.value.data.targetId.id
        && points.value.length >= 2
        && points.value[0].absTimeMs < now
        && points.value[points.value.length - 1].absTimeMs > now
      ) {
        const copy = deepCopy(points.value);
        copy[index] = changed;

        const current = intermediateTemp(points.value, now);
        const projected = intermediateTemp(copy, now);

        // Check if this change would cause a jump in target setting
        if (current !== null
          && projected !== null
          && !bloxQty(current).eq(projected)) {

          const pinned: DisplaySetpoint = {
            offsetMs: now - start.value,
            absTimeMs: now,
            temperature: current,
          };

          const [first, second] = [pinned, changed].sort(makeObjectSorter('absTimeMs'));

          createDialog({
            component: 'ConfirmDialog',
            componentProps: {
              title: 'Insert point',
              message: `
            Do you want to insert an extra point to prevent an instant jump
            from <b>${current}</b> to <b>${projected}</b>?`,
              html: true,
              cancel: 'No',
              ok: 'Yes',
            },
          })
            .onOk(() => splicePoints(index, first, second))
            .onCancel(() => splicePoints(index, changed));

          // Insert is now handled in createDialog callbacks
          return;
        }
      }

      // Default behaviour: only insert changed point
      splicePoints(index, changed);
    }

    function updatePointTime(index: number, date: Date): void {
      const absTimeMs = date.getTime();
      if (absTimeMs < start.value) {
        notifyInvalidTime();
      }
      else {
        changePoint(index, {
          absTimeMs,
          temperature: points.value[index].temperature,
          offsetMs: absTimeMs - start.value,
        });
      }
    }

    function updatePointOffset(index: number, offsetMs: number): void {
      if (offsetMs < 0) {
        notifyInvalidTime();
      }
      else {
        changePoint(index, {
          offsetMs,
          temperature: points.value[index].temperature,
          absTimeMs: start.value + offsetMs,
        });
      }
    }

    function updatePointTemperature(index: number, value: Quantity): void {
      changePoint(index, {
        ...points.value[index],
        temperature: value,
      });
    }

    return {
      durationString,
      durationMs,
      bloxQty,
      serviceId,
      block,
      saveBlock,
      start,
      updateStartTime,
      points,
      updatePointOffset,
      updatePointTime,
      updatePointTemperature,
      removePoint,
      addPoint,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="q-ma-md row q-gutter-xs">
      <DatetimeField
        :model-value="start"
        label="Start time"
        title="Start time"
        html
        message="
          This will shift all points.
          <br>Offset time will remain the same, absolute time values will change.
          <br>The offset for the first point is always 0s."
        class="col-grow"
        @update:model-value="updateStartTime"
      />
      <LinkField
        :model-value="block.data.targetId"
        :service-id="serviceId"
        label="Driven Setpoint"
        title="Driven Setpoint/Sensor pair"
        class="col-grow"
        @update:model-value="v => { block.data.targetId = v; saveBlock(); }"
      />

      <div class="col-break" />

      <div
        v-for="(point, idx) in points"
        :key="idx"
        class="col-12 row q-gutter-xs q-mt-none profile-point"
      >
        <DurationField
          :model-value="bloxQty(point.offsetMs, 'ms')"
          title="Offset from start time"
          label="Offset"
          html
          message="
            This will change the point offset.
            <br>The absolute point time will be changed to start time + offset.
            <br>Changing point offset may change point order."
          class="col min-width-sm"
          @update:model-value="v => updatePointOffset(idx, durationMs(v))"
        />
        <DatetimeField
          :model-value="point.absTimeMs"
          title="Time"
          label="Time"
          html
          message="
            This will change the absolute point time.
            <br>Changing point time may change point order.
            <br>Point offset is changed to point time - start time."
          class="col min-width-sm"
          @update:model-value="v => updatePointTime(idx, v)"
        />
        <QuantityField
          :model-value="point.temperature"
          title="Temperature"
          label="Temperature"
          class="col min-width-sm"
          @update:model-value="v => updatePointTemperature(idx, v)"
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
