<script setup lang="ts">
import { LoggedSession } from '../types';
import { useField, UseFieldProps } from '@/composables';
import { dateString } from '@/utils/quantity';
import escapeRegExp from 'lodash/escapeRegExp';
import { computed, ref } from 'vue';

interface SessionOpt extends SelectOption {
  session: LoggedSession;
}

interface Props extends UseFieldProps {
  modelValue: LoggedSession | null;
  sessions: LoggedSession[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
});

const emit = defineEmits<{
  'update:modelValue': [payload: LoggedSession | null];
}>();

function asOpt(session: LoggedSession): SessionOpt {
  return {
    session,
    label: `${session.title} (${dateString(session.date)})`,
    value: session.id,
  };
}

const sessionOpts = computed<SessionOpt[]>(() => props.sessions.map(asOpt));

const filteredOpts = ref<SessionOpt[]>(sessionOpts.value);

function filterFn(inputValue: string, update: (cb: () => void) => void): void {
  if (inputValue === '') {
    update(() => (filteredOpts.value = sessionOpts.value));
    return;
  }

  update(() => {
    const needle = escapeRegExp(inputValue.toLowerCase());
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
