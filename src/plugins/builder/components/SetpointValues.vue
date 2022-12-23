<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { userUnits } from '@/user-settings';
import { makeTypeFilter } from '@/utils/functional';
import { preciseNumber, prettyUnit } from '@/utils/quantity';
import { BlockType, PidBlock } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';
import { useSettingsBlock } from '../composables';
import { SetpointBlockT, SETPOINT_KEY, SETPOINT_TYPES } from '../const';

const pidFilter = makeTypeFilter<PidBlock>(BlockType.Pid);

export default defineComponent({
  name: 'SetpointValues',
  props: {
    width: {
      type: Number,
      default: 100,
    },
    height: {
      type: Number,
      default: 50,
    },
    settingsKey: {
      type: String,
      default: SETPOINT_KEY,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    borderColor: {
      type: String,
      default: 'white',
    },
    always: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();
    const {
      address,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
    } = useSettingsBlock.setup<SetpointBlockT>(
      props.settingsKey,
      SETPOINT_TYPES,
    );

    const isUsed = computed<boolean>(
      () =>
        block.value !== null &&
        block.value.data.enabled &&
        sparkStore
          .blocksByService(address.value.serviceId)
          .filter(pidFilter)
          .some((blk) => blk.data.inputId.id === address.value.id),
    );

    const setpointSetting = computed<number | null>(() =>
      block.value && isUsed.value
        ? block.value.data.desiredSetting.value
        : null,
    );

    const setpointValue = computed<number | null>(
      () => block.value?.data.value.value ?? null,
    );

    const tempUnit = computed<string>(() =>
      prettyUnit(userUnits.value.temperature),
    );

    return {
      preciseNumber,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
      showBlockSelectDialog,
      setpointSetting,
      setpointValue,
      tempUnit,
    };
  },
});
</script>

<template>
  <svg
    v-if="block || always"
    v-bind="{ x, y, width, height }"
    viewBox="0 0 100 50"
  >
    <BrokenSvgIcon
      v-if="isBroken"
      x="30"
    />
    <UnlinkedSvgIcon
      v-else-if="!block"
      x="30"
    />
    <template v-else>
      <BlockStatusSvg :status="blockStatus" />
      <SensorSvgIcon
        x="20"
        y="3"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="5"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ preciseNumber(setpointValue) }}
          <small>{{ tempUnit }}</small>
        </div>
      </foreignObject>
      <SetpointSvgIcon
        x="20"
        y="25"
        width="20"
        height="20"
      />
      <foreignObject
        x="40"
        y="27"
        width="50"
        height="18"
      >
        <div class="fit builder-text">
          {{ preciseNumber(setpointSetting) }}
          <small>{{ tempUnit }}</small>
        </div>
      </foreignObject>
    </template>
    <BuilderBorder
      v-if="bordered"
      :width="100"
      :color="borderColor"
    />
    <BuilderInteraction
      :width="100"
      @interact="showBlockDialog"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            :disable="!block"
            clickable
            @click="showBlockDialog"
          >
            <q-item-section>Show block</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            clickable
            @click="showBlockSelectDialog"
          >
            <q-item-section>Assign block</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
