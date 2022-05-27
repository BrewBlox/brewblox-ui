<script lang="ts">
import format from 'date-fns/format';
import isEqual from 'date-fns/isEqual';
import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

type DateFormatType = 'date' | 'number' | 'string';

export default defineComponent({
  name: 'DatetimeInput',
  props: {
    modelValue: {
      type: [Date, Number, String] as PropType<Date | number | string | null>,
      default: null,
    },
    output: {
      type: String as PropType<DateFormatType>,
      default: 'date',
    },
    dateAttrs: {
      type: Object as PropType<AnyDict>,
      default: () => ({}),
    },
    timeAttrs: {
      type: Object as PropType<AnyDict>,
      default: () => ({}),
    },
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    function asDate(v: Date | number | string | null): Date | null {
      if (typeof v === 'number') {
        return new Date(v);
      } else if (typeof v === 'string') {
        return parseISO(v);
      } else if (v instanceof Date) {
        return v;
      } else {
        return null;
      }
    }

    function asDateString(v: Date | null): string {
      return v !== null && isValid(v) ? format(v, 'yyyy-MM-dd') : '';
    }

    function asTimeString(v: Date | null): string {
      return v !== null && isValid(v) ? format(v, 'HH:mm:ss') : '';
    }

    function save(v: Date | null): void {
      let output: Date | string | number | null = v;
      if (v && props.output === 'string') {
        output = v.toISOString();
      }
      if (v && props.output === 'number') {
        output = v.getTime();
      }
      emit('update:model-value', output);
    }

    const local = ref<Date | null>(asDate(props.modelValue));

    function combine(
      dateVal: string | undefined,
      timeVal: string | undefined,
    ): Date | null {
      const dv = dateVal ?? asDateString(local.value);
      const tv = timeVal ?? asTimeString(local.value);
      return parseISO(`${dv} ${tv}`);
    }

    const dateString = computed<string>(() => asDateString(local.value));

    const timeString = computed<string>(() => asTimeString(local.value));

    watch(
      () => props.modelValue,
      (v) => {
        const dt = asDate(v);
        if (dt === null) {
          local.value = null;
        } else if (!local.value || !isEqual(dt, local.value)) {
          local.value = dt;
        }
      },
    );

    return {
      dateString,
      timeString,
      combine,
      save,
    };
  },
});
</script>

<template>
  <div class="row q-gutter-md">
    <q-input
      :model-value="dateString"
      label="Date"
      type="date"
      stack-label
      class="col-grow"
      v-bind="dateAttrs"
      @change="(v) => save(combine(v, undefined))"
    />
    <q-input
      :model-value="timeString"
      label="Time"
      type="time"
      step="1"
      stack-label
      class="col-grow"
      v-bind="timeAttrs"
      @change="(v) => save(combine(undefined, v))"
    />
  </div>
</template>
