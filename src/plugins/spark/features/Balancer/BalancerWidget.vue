<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { fixedNumber, prettyLink } from '@/utils/quantity';
import { BalancerBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalancerWidget',
  setup() {
    const { block } = useBlockWidget.setup<BalancerBlock>();

    return {
      prettyLink,
      fixedNumber,
      block,
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
        <div class="col">Client</div>
        <div class="col">Granted</div>
        <div class="col">Requested</div>
      </div>

      <div
        v-for="client in block.data.clients"
        :key="`client-${client.id}`"
        class="col-auto row q-gutter-x-sm"
      >
        <div class="col text-italic">
          {{ prettyLink(client.id) }}
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
