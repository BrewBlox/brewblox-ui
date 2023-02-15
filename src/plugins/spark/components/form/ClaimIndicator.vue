<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';
import { BlockClaim } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ClaimIndicator',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    blockId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();

    const claim = computed<BlockClaim | undefined>(() =>
      sparkStore
        .claimsByService(props.serviceId)
        .find((c) => c.target === props.blockId),
    );

    const claimedBy = computed<string | null>(() =>
      claim.value ? claim.value.intermediate[0] ?? claim.value.source : null,
    );

    function showClaimingBlock(): void {
      if (claimedBy.value) {
        createBlockDialog(
          {
            serviceId: props.serviceId,
            id: claimedBy.value,
            type: null,
          },
          { mode: 'Basic' },
        );
      }
    }

    return {
      claim,
      claimedBy,
      showClaimingBlock,
    };
  },
});
</script>

<template>
  <q-list
    :class="[{ clickable: claim != null }]"
    class="rounded-borders"
  >
    <template v-if="claim">
      <div
        class="col-auto q-pa-sm q-gutter-x-sm text-indigo-4 row"
        @click="showClaimingBlock"
      >
        <q-tooltip>Edit {{ claimedBy }}</q-tooltip>
        <q-icon
          name="mdi-fast-forward-outline"
          class="col-auto"
          size="sm"
        />
        <div class="col-auto darkish">
          <div>
            <i>{{ claim.source }}</i>
          </div>
          <div
            v-for="(id, idx) in [...claim.intermediate, blockId]"
            :key="'intermediate-' + id"
            :style="`margin-left: ${idx * 5}px`"
          >
            <q-icon
              name="mdi-keyboard-return"
              style="transform: scale(-1, 1)"
            />
            {{ id }}
          </div>
        </div>
      </div>
    </template>
    <div
      v-else
      class="col-auto q-pa-sm darkish text-italic text-small"
    >
      Not claimed
    </div>
  </q-list>
</template>
