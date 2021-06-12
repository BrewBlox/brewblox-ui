<script lang="ts">
import get from 'lodash/get';
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { BalancerBlock } from '@/plugins/spark/types';
import { Block } from '@/shared-types';
import { fixedNumber } from '@/utils/formatting';

export default defineComponent({
  name: 'BalancerWidget',
  setup() {
    const {
      sparkModule,
      block,
    } = useBlockWidget.setup<BalancerBlock>();

    const clientNames = computed<Mapped<string>>(
      () => {
        const result = {};
        sparkModule
          .blocks
          .forEach((v: Block) => {
            const constraint = get(v, 'data.constrainedBy.constraints', [])
              .find(constraint => get(constraint, 'balanced.balancerId.id') === block.value.id);
            if (constraint) {
              result[constraint.balanced.id] = v.id;
            }
          });
        return result;
      },
    );

    function clientName(id: number): string {
      return clientNames.value[id] || `${id}` || 'unknown';
    }

    return {
      fixedNumber,
      sparkModule,
      block,
      clientName,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div class="column q-ma-md q-gutter-y-sm">
      <div class="col-auto row q-gutter-x-sm darkened">
        <div class="col">
          Client
        </div>
        <div class="col">
          Granted
        </div>
        <div class="col">
          Requested
        </div>
      </div>

      <div
        v-for="client in block.data.clients"
        :key="`client-${client.id}`"
        class="col-auto row q-gutter-x-sm"
      >
        <div class="col text-italic">
          {{ clientName(client.id) }}
        </div>
        <div class="col">
          {{ fixedNumber(client.granted) }}
        </div>
        <div class="col">
          {{ fixedNumber(client.requested) }}
        </div>
      </div>
    </div>
  </Card>
</template>
