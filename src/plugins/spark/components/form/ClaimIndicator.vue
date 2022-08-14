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

    const claimText = computed<string[]>(() => {
      if (!claim.value) {
        return [];
      }
      return [...claim.value.intermediate, claim.value.source].map(
        (id, idx) => {
          return idx === 0
            ? `Claimed by <i>${id}</i>`
            : `&emsp; which is claimed by <i>${id}</i>`;
        },
      );
    });

    function showSource(): void {
      if (claim.value) {
        createBlockDialog({
          serviceId: props.serviceId,
          id: claim.value.source,
          type: null,
        });
      }
    }

    return {
      claim,
      claimText,
      showSource,
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
        @click="showSource"
      >
        <q-tooltip>Edit {{ claim.source }}</q-tooltip>
        <q-icon
          name="mdi-fast-forward-outline"
          class="col-auto"
          size="sm"
        />
        <div class="col-auto darkish text-small">
          <div>
            Claimed by <i>{{ claim.source }}</i>
          </div>
          <div
            v-for="(id, idx) in claim.intermediate"
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
