<script setup lang="ts">
import { BlockType } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';
import { SPARK_SERVICE_TYPE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { Service, ServiceStub, useServiceStore } from '@/store/services';
import { makeTypeFilter } from '@/utils/functional';
import { startCreateService } from '@/utils/services';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { QuickstartConfig } from '../types';

const props = defineProps<UseTaskProps<QuickstartConfig>>();

const emit = defineEmits<UseTaskEmits<QuickstartConfig>>();

const sparkFilter = makeTypeFilter(SPARK_SERVICE_TYPE);

const serviceStore = useServiceStore();
const sparkStore = useSparkStore();
const serviceId = computed<string>(() => props.config.serviceId);
const service = ref<Service | null>(serviceStore.serviceById(serviceId.value));
const handleExisting = ref<'keep' | 'clear' | null>(null);

const services = computed<Service[]>(() =>
  serviceStore.services.filter(sparkFilter),
);

const stubs = computed<ServiceStub[]>(() =>
  serviceStore.stubs.filter(sparkFilter),
);

if (!service.value && services.value.length === 1 && stubs.value.length === 0) {
  service.value = services.value[0];
}

const hasBlocks = computed<boolean>(
  // Ignore discovered blocks
  // Any previous control chain will have included a PID
  () =>
    sparkStore
      .blocksByService(service.value?.id)
      .find((v) => v.type === BlockType.Pid) !== undefined,
);

const ready = computed<boolean>(
  () =>
    sparkStore.has(service.value?.id) &&
    (!hasBlocks.value || handleExisting.value !== null),
);

async function taskDone(): Promise<void> {
  if (!service.value || !ready.value) {
    return;
  }
  const serviceId = service.value.id;
  if (handleExisting.value === 'clear') {
    sparkStore.clearBlocks(serviceId);
  }
  emit('update:config', { ...props.config, serviceId });
  emit('next');
}
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Pick a Spark service
          </q-item-label>
        </q-item-section>
      </q-item>

      <component
        :is="services.length >= 10 ? 'q-select' : 'ListSelect'"
        v-model="service"
        :options="services"
        option-value="id"
        option-label="title"
        class="q-mx-sm"
        label="Service"
      />

      <div
        v-for="stub in stubs"
        :key="'stub-' + stub.id"
        class="q-mt-lg q-pa-md column items-center q-gutter-md"
      >
        <q-icon
          name="warning"
          color="warning"
          size="md"
          class="col-auto"
        />
        <span>
          Detected new Spark service <i>{{ stub.id }}</i>
        </span>
        <div class="row q-gutter-x-sm">
          <q-btn
            outline
            label="Add service to UI"
            @click="startCreateService(stub)"
          />
        </div>
      </div>

      <div
        v-if="service && hasBlocks"
        class="q-mt-lg q-pa-md column items-center q-gutter-md"
      >
        <q-icon
          name="warning"
          color="warning"
          size="md"
          class="col-auto"
        />
        <span class="no-select">
          You already have blocks on <i>{{ service.title }}</i>
        </span>
        <div class="row q-gutter-x-sm">
          <q-btn
            outline
            label="Keep blocks"
            :color="handleExisting === 'keep' ? 'primary' : ''"
            @click="handleExisting = 'keep'"
          />
          <q-btn
            outline
            label="Fresh start"
            :color="handleExisting === 'clear' ? 'primary' : ''"
            @click="handleExisting = 'clear'"
          />
        </div>
      </div>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        :disable="!ready"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </QuickstartCard>
</template>
