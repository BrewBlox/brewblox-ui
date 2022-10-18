<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import { deepCopy } from '@/utils/objects';
import { bloxQty, durationMs, durationString, tempQty } from '@/utils/quantity';
import { Quantity, Setpoint, SetpointProfileBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

interface DisplaySetpoint {
  datetime: Date;
  offset: Quantity;
  temperature: Quantity;
}

export default defineComponent({
  name: 'SetpointProfileFull',
  setup() {
    const { serviceId, block, patchBlock } =
      useBlockWidget.setup<SetpointProfileBlock>();

    const start = computed<Date>({
      get: () => new Date(block.value.data.start ?? 0),
      set: (v) => patchBlock({ start: v.toISOString() }),
    });

    const points = computed<DisplaySetpoint[]>(() =>
      [...block.value.data.points]
        .sort((lhs, rhs) => durationMs(lhs.time) - durationMs(rhs.time))
        .map((point: Setpoint) => ({
          datetime: new Date(start.value.getTime() + durationMs(point.time)),
          offset: point.time,
          temperature: point.temperature,
        })),
    );

    function savePoints(pts: DisplaySetpoint[] = points.value): void {
      patchBlock({
        points: [...pts]
          .sort((lhs, rhs) => lhs.datetime.getTime() - rhs.datetime.getTime())
          .map((point: DisplaySetpoint) => ({
            time: point.offset,
            temperature: point.temperature,
          })),
      });
    }

    function defaultPoint(): DisplaySetpoint {
      return {
        datetime: new Date(start.value),
        offset: bloxQty(0, 's'),
        temperature: tempQty(20),
      };
    }

    function addPoint(): void {
      const newPoint =
        points.value.length > 0
          ? deepCopy(points.value[points.value.length - 1])
          : defaultPoint();
      points.value.push(newPoint);
      savePoints();
    }

    function removePoint(index: number): void {
      points.value.splice(index, 1);
      savePoints();
    }

    function notifyInvalidTime(): void {
      notify.warn('Point time must be later than start time', {
        logged: false,
      });
    }

    function intermediateTemp(
      points: DisplaySetpoint[],
      date: Date,
    ): Quantity | null {
      const nextIdx = points.findIndex(
        (point) => point.datetime.getTime() >= date.getTime(),
      );
      if (nextIdx < 1) {
        return null;
      }

      const prev = points[nextIdx - 1];
      const next = points[nextIdx];
      const prevVal = prev.temperature.value!;
      const nextVal = next.temperature.value!;
      const duration = next.datetime.getTime() - prev.datetime.getTime() || 1;
      const interpolated =
        prevVal +
        ((date.getTime() - prev.datetime.getTime()) * (nextVal - prevVal)) /
          duration;
      return bloxQty(prev.temperature).copy(interpolated);
    }

    function splicePoints(index, ...items: DisplaySetpoint[]): void {
      points.value.splice(index, 1, ...items);
      savePoints();
    }

    function changePoint(index: number, changed: DisplaySetpoint): void {
      const now = new Date();

      // Check if temp is currently managed by profile
      if (
        block.value.data.enabled &&
        block.value.data.targetId.id &&
        points.value.length >= 2 &&
        points.value[0].datetime.getTime() < now.getTime() &&
        points.value[points.value.length - 1].datetime.getTime() > now.getTime()
      ) {
        const copy = deepCopy(points.value);
        copy[index] = changed;

        const current = intermediateTemp(points.value, now);
        const projected = intermediateTemp(copy, now);

        // Check if this change would cause a jump in target setting
        if (
          current !== null &&
          projected !== null &&
          !bloxQty(current).eq(projected)
        ) {
          const pinned: DisplaySetpoint = {
            offset: bloxQty(now.getTime() - start.value.getTime(), 'ms'),
            datetime: now,
            temperature: current,
          };

          const [first, second] = [pinned, changed].sort(
            (lhs, rhs) => lhs.datetime.getTime() - rhs.datetime.getTime(),
          );

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

    function updatePointTime(index: number, datetime: Date): void {
      if (datetime.getTime() < start.value.getTime()) {
        notifyInvalidTime();
      } else {
        changePoint(index, {
          datetime,
          temperature: points.value[index].temperature,
          offset: bloxQty(datetime.getTime() - start.value.getTime(), 'ms'),
        });
      }
    }

    function updatePointOffset(index: number, offset: Quantity): void {
      if (!offset.value || offset.value < 0) {
        notifyInvalidTime();
      } else {
        changePoint(index, {
          offset,
          temperature: points.value[index].temperature,
          datetime: new Date(start.value.getTime() + durationMs(offset)),
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
      patchBlock,
      start,
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
        v-model="start"
        label="Start time"
        title="Start time"
        html
        message="
          This will shift all points.
          <br>Offset time will remain the same, absolute time values will change.
          <br>The offset for the first point is always 0s."
        class="col-grow"
      />
      <LinkField
        :model-value="block.data.targetId"
        :service-id="serviceId"
        label="Target Setpoint"
        title="Target Setpoint"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ targetId: v })"
      />

      <div class="col-break" />

      <div
        v-for="(point, idx) in points"
        :key="idx"
        class="col-12 row q-gutter-xs q-mt-none profile-point"
      >
        <DurationField
          :model-value="point.offset"
          title="Offset from start time"
          label="Offset"
          html
          message="
            This will change the point offset.
            <br>The absolute point time will be changed to start time + offset.
            <br>Changing point offset may change point order."
          class="col min-width-sm"
          @update:model-value="(v) => updatePointOffset(idx, v)"
        />
        <DatetimeField
          :model-value="point.datetime"
          title="Time"
          label="Time"
          html
          message="
            This will change the absolute point time.
            <br>Changing point time may change point order.
            <br>Point offset is changed to point time - start time."
          class="col min-width-sm"
          @update:model-value="(v) => updatePointTime(idx, v)"
        />
        <QuantityField
          :model-value="point.temperature"
          title="Temperature"
          label="Temperature"
          class="col min-width-sm"
          @update:model-value="(v) => updatePointTemperature(idx, v)"
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
        <q-btn
          fab-mini
          icon="add"
          color="indigo-4"
          @click="addPoint"
        >
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
