<script setup lang="ts">
import { LoggedSession } from '../types';
import { useField } from '@/composables';
import { dateString } from '@/utils/quantity';
import escapeRegExp from 'lodash/escapeRegExp';
import { computed, defineComponent, PropType, ref } from 'vue';

interface SessionOpt extends SelectOption {
  session: LoggedSession;
}

function asOpt(session: LoggedSession): SessionOpt {
  return {
    session,
    label: `${session.title} (${dateString(session.date)})`,
    value: session.id,
  };
}

export default defineComponent({
  name: 'SessionSelectField',
  props: {
    ...useField.props,
    modelValue: {
      type: null as unknown as PropType<LoggedSession | null>,
      default: null,
    },
    sessions: {
      type: Array as PropType<LoggedSession[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const sessionOpts = computed<SessionOpt[]>(() => props.sessions.map(asOpt));

    const filteredOpts = ref<SessionOpt[]>(sessionOpts.value);

    function filterFn(val, update): void {
      if (val === '') {
        update(() => (filteredOpts.value = sessionOpts.value));
        return;
      }

      update(() => {
        const needle = escapeRegExp(val.toLowerCase());
        filteredOpts.value = sessionOpts.value.filter(
          (opt) =>
            opt.label.toLowerCase().match(needle) ||
            opt.session.tags?.some((t) => t.toLowerCase().match(needle)),
        );
      });
    }

    const selectedOpt = computed<SessionOpt | null>({
      get: () => (props.modelValue !== null ? asOpt(props.modelValue) : null),
      set: (opt) => emit('update:modelValue', opt?.session ?? null),
    });

    return {
      filteredOpts,
      filterFn,
      selectedOpt,
    };
  },
});
</script>

<template>
  <q-select
    v-model="selectedOpt"
    :options="filteredOpts"
    :label="label"
    autofocus
    clearable
    item-aligned
    use-input
    fill-input
    hide-selected
    placeholder="Search by name or tag"
    @filter="filterFn"
    @keyup.enter.exact.stop
  >
    <template #option="{ opt, selected, toggleOption }">
      <q-item
        :active="selected"
        clickable
        @click="toggleOption(opt)"
      >
        <q-item-section style="max-width: 300px">
          {{ opt.label }}
          <q-item-label
            v-if="opt.session.tags && opt.session.tags.length > 0"
            caption
          >
            <div class="row wrap q-gutter-xs">
              <q-badge
                v-for="tag in opt.session.tags"
                :key="`tag-${opt.value}-${tag}`"
                color="blue-grey-8"
              >
                <small>{{ tag }}</small>
              </q-badge>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
