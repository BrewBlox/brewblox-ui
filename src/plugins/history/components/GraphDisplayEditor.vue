<script lang="ts">
import { GraphAxis, GraphConfig } from '../types';
import { defaultLabel } from '@/plugins/history/nodes';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

export default defineComponent({
  name: 'GraphDisplayEditor',
  props: {
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {
    const axisOpts: SelectOption<GraphAxis>[] = [
      {
        value: 'y',
        label: 'Y1',
      },
      {
        value: 'y2',
        label: 'Y2',
      },
    ];

    const local = ref<GraphConfig>({ ...props.config });
    watch(props.config, (cfg) => {
      local.value = { ...cfg };
    });

    function saveLocalConfig(config: GraphConfig = local.value): void {
      emit('update:config', config);
    }

    const selected = computed<string[]>(() => props.config.fields);

    function saveAxis(field: string, value: GraphAxis): void {
      local.value.axes[field] = value;
      saveLocalConfig();
    }

    function saveColor(field: string, color: string | null): void {
      local.value.colors[field] = color || '';
      saveLocalConfig();
    }

    function fieldRename(field: string): string {
      return local.value.renames[field] ?? defaultLabel(field);
    }

    function saveRename(field: string, label: string | null): void {
      local.value.renames[field] = label ?? defaultLabel(field);
      saveLocalConfig();
    }

    return {
      axisOpts,
      local,
      selected,
      saveAxis,
      saveColor,
      fieldRename,
      saveRename,
    };
  },
});
</script>

<template>
  <q-list>
    <div
      v-for="field in selected"
      :key="field"
      class="align-children row wrap q-pa-sm"
    >
      <q-item-section class="col-5">
        <InputField
          :model-value="fieldRename(field)"
          title="Legend"
          @update:model-value="(v) => saveRename(field, v)"
        />
      </q-item-section>
      <q-space />
      <q-item-section class="col-grow">
        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label caption> Key </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              {{ field }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption> Line color </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <ColorField
                :model-value="local.colors[field] || ''"
                title="Line color"
                clearable
                @update:model-value="(v) => saveColor(field, v)"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption> Y-axis </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn-toggle
                :model-value="local.axes[field] || 'y'"
                :options="axisOpts"
                flat
                stretch
                @update:model-value="(v) => saveAxis(field, v)"
              />
            </q-item-section>
          </q-item>
          <q-separator />
        </q-list>
      </q-item-section>
    </div>
    <q-item v-if="!selected || selected.length === 0">
      <q-item-section side> No metrics selected </q-item-section>
    </q-item>
    <q-item>
      <q-space />
      <q-item-section class="col-auto">
        <q-btn
          outline
          round
          icon="edit"
        >
          <q-tooltip>Edit targets</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>
