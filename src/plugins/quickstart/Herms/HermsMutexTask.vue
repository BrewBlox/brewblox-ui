<script setup lang="ts">
import { ref } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { HermsConfig } from './types';

const props = defineProps<UseTaskProps<HermsConfig>>();

const emit = defineEmits<UseTaskEmits<HermsConfig>>();

const mutex = ref<boolean>(true);

function done(): void {
  emit('update:config', { ...props.config, mutex: mutex.value });
  emit('next');
}
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Heating elements configuration
          </q-item-label>
          <p>
            We will create PWM blocks to modulate the power of your heating
            elements.
          </p>
          <p>
            If you cannot run both heating elements at the same time, because
            the total available power is limited, we can configure constraints
            to:
          </p>
          <ul>
            <li>
              Prevent turning on both elements at any time
              <i>(Mutually exclusive)</i>
            </li>
            <li>
              Divide the time fairly between them when heating both kettles
              <i>(Balanced)</i>
            </li>
          </ul>
          <p class="text-weight-regular">
            Turn ON the setting below if the running both elements at the same
            time would trip a fuse.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-toggle
          v-model="mutex"
          class="q-mx-auto"
          left-label
          label="Mutually exclusive heaters"
        />
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        unelevated
        label="Next"
        color="primary"
        @click="done"
      />
    </template>
  </QuickstartCard>
</template>
