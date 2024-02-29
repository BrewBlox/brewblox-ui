<script setup lang="ts">
import { DigitalState, VarContainer, VariablesBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { selectable } from '@/utils/collections';
import { createDialogPromise } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';
import { makeRuleValidator, suggestId } from '@/utils/rules';

type ContainerKey = Exclude<KeysOfUnion<VarContainer>, 'empty'>;

const keyLabels: Record<ContainerKey, string> = {
  analog: 'Number',
  digital: 'Digital State',
  temp: 'Temperature',
  deltaTemp: 'Temperature delta',
  timestamp: 'Timestamp',
  duration: 'Duration',
  link: 'Block link',
};

const { block, serviceId, patchBlock } = useBlockWidget.setup<VariablesBlock>();

const sortedVars = computed<[key: string, container: VarContainer][]>(() =>
  Object.entries(block.value.data.variables).sort((a, b) =>
    a[0].localeCompare(b[0]),
  ),
);

function makeDefault(key: ContainerKey): VarContainer {
  switch (key) {
    case 'analog':
      return { analog: 0 };
    case 'digital':
      return { digital: DigitalState.STATE_INACTIVE };
    case 'temp':
      return { temp: tempQty(20) };
    case 'deltaTemp':
      return { deltaTemp: deltaTempQty(0) };
    case 'timestamp':
      return { timestamp: '' };
    case 'duration':
      return { duration: bloxQty('0s') };
    case 'link':
      return { link: bloxLink(null) };
  }
}

function patchVar(key: string, container: VarContainer): void {
  patchBlock({ variables: { [key]: container } });
}

async function addVar(): Promise<void> {
  const key: ContainerKey | undefined = await createDialogPromise({
    component: 'SelectDialog',
    componentProps: {
      title: 'Variable type',
      modelValue: null,
      selectOptions: selectable(keyLabels),
      listSelect: true,
    },
  });

  if (!key) {
    return;
  }

  const rules: InputRule[] = [
    (v) => v.length > 0 || 'Name must not be empty',
    (v) => v.length < 16 || 'Name must be less than 16 characters',
    (v) =>
      /^[\w\-]+$/.test(v) ||
      'Name can only contain letters, numbers, underscores, and dashes',
    (v) =>
      !sortedVars.value.map((v) => v[0]).includes(v) || 'Name must be unique',
  ];

  const name: string | undefined = await createDialogPromise({
    component: 'TextDialog',
    componentProps: {
      title: 'Variable name',
      modelValue: suggestId(key, makeRuleValidator(rules)),
      rules,
    },
  });

  if (name) {
    patchVar(name, makeDefault(key));
  }
}
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div class="q-pa-md q-gutter-xs row justify-end">
      <template
        v-for="([key, container], idx) in sortedVars"
        :key="`var-container-entry ${idx} ${key}`"
      >
        <VarContainerField
          :model-value="container"
          :service-id="serviceId"
          :label="key"
          class="col-grow"
          @update:model-value="(v) => patchVar(key, v)"
        />
        <q-btn
          flat
          round
          size="small"
          class="self-center"
          icon="mdi-delete"
          @click="patchVar(key, { empty: true })"
        >
          <q-tooltip>Remove '{{ key }}'</q-tooltip>
        </q-btn>
        <div class="col-break" />
      </template>
      <q-btn
        flat
        dense
        color="secondary"
        icon="add"
        label="New variable"
        class="self-end"
        @click="addVar"
      />
    </div>
  </Card>
</template>
