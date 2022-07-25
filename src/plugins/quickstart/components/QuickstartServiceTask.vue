<script lang="ts">
import { sparkType } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { Service, ServiceStub, useServiceStore } from '@/store/services';
import { startCreateService } from '@/utils/services';
import { BlockType } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType, ref } from 'vue';
import { QuickstartConfig } from '../types';

export default defineComponent({
  name: 'QuickstartServiceTask',
  props: {
    config: {
      type: Object as PropType<QuickstartConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const serviceStore = useServiceStore();
    const sparkStore = useSparkStore();
    const serviceId = computed<string>(() => props.config.serviceId);
    const service = ref<Service | null>(
      serviceStore.serviceById(serviceId.value),
    );
    const handleExisting = ref<'keep' | 'clear' | null>(null);

    const services = computed<Service[]>(() =>
      serviceStore.services.filter((v) => v.type === sparkType),
    );

    const stubs = computed<ServiceStub[]>(() =>
      serviceStore.stubs.filter((v) => v.type === sparkType),
    );

    if (
      !service.value &&
      services.value.length === 1 &&
      stubs.value.length === 0
    ) {
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

    return {
      handleExisting,
      service,
      services,
      stubs,
      hasBlocks,
      ready,
      startCreateService,
      taskDone,
    };
  },
});
</script>

<template>
  <WizardBody>
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
  </WizardBody>
</template>
