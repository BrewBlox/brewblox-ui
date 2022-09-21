<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { MutexBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MutexFull',
  setup() {
    const { block, patchBlock } = useBlockWidget.setup<MutexBlock>();

    return {
      block,
      patchBlock,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <p>
            Mutex is short for
            <b>Mut</b>ually <b>Ex</b>clusive.
          </p>
          <p>
            If you add a Mutex constraint to multiple digital actuators, they
            will never be active at the same time if they share the same Mutex
            block.
          </p>
          <p>This can be used to:</p>
          <ul>
            <li>Prevent heating and cooling at the same time.</li>
            <li>
              Prevent two or more heating elements from exceeding your maximum
              available power.
            </li>
          </ul>
          <p>
            The Mutex can also prevent switching between two actuators too
            quickly.<br />
            If you set the extra lock time in a Mutex constraint to 45 minutes,
            a heater can only turn on after the cooler has been inactive for 45
            minutes.
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>
  </div>
</template>
