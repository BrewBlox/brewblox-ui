<script setup lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockWidget } from '@/plugins/spark/types';
import { discoverBlocks } from '@/plugins/spark/utils/actions';
import {
  isDiscoveredBlockType,
  isSystemBlockType,
} from '@/plugins/spark/utils/info';
import { createDialogPromise } from '@/utils/dialog';
import { Block, BlockType } from 'brewblox-proto/ts';
import { computed, onMounted, PropType } from 'vue';

const props = defineProps({
  widget: {
    type: Object as PropType<BlockWidget>,
    required: true,
  },
  valid: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String as PropType<BlockType>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:widget', value: BlockWidget): void;
  (e: 'update:valid', value: boolean): void;
}>();

const sparkStore = useSparkStore();

const isSystemBlock = computed<boolean>(() => isSystemBlockType(props.type));

const isDiscoveredBlock = computed<boolean>(() =>
  isDiscoveredBlockType(props.type),
);

const address = computed<BlockAddress>({
  get: () => ({
    id: props.widget.config.blockId || null,
    serviceId: props.widget.config.serviceId || null,
    type: props.type,
  }),
  set: (v) => {
    emit('update:widget', {
      ...props.widget,
      config: { blockId: v.id!, serviceId: v.serviceId! },
    });
    emit('update:valid', Boolean(v.id && v.serviceId));
  },
});

function discoverAll(): void {
  sparkStore.serviceIds.forEach((id) => discoverBlocks(id));
}

async function createBlock(): Promise<void> {
  const created: Maybe<Block> = await createDialogPromise({
    component: 'BlockWizardDialog',
    componentProps: {
      addWidget: false,
      compatible: props.type,
      showCreated: false,
    },
  });
  if (created) {
    const { id, serviceId, type } = created;
    address.value = { id, serviceId, type };
  }
}

onMounted(() => {
  const { blockId, serviceId } = props.widget.config;
  emit('update:valid', Boolean(blockId && serviceId));
});
</script>

<template>
  <div class="column q-gutter-y-sm">
    <CardWarning v-if="isDiscoveredBlock">
      <template #message> '{{ type }}' is a discovered block type. </template>
      <template #actions>
        <q-btn
          flat
          color="secondary"
          icon="mdi-magnify-plus-outline"
          label="Discover blocks"
          class="self-end"
          @click="discoverAll"
        />
      </template>
    </CardWarning>
    <CardWarning v-else-if="isSystemBlock">
      <template #message> '{{ type }}' is a system block type. </template>
    </CardWarning>
    <BlockAddressField
      v-model="address"
      :compatible="type"
      :creatable="!isSystemBlock && !isDiscoveredBlock"
      any-service
    />
    <q-btn
      v-if="!isSystemBlock && !isDiscoveredBlock"
      flat
      color="secondary"
      icon="add"
      label="Create block"
      class="self-end"
      @click="createBlock"
    />
  </div>
</template>
