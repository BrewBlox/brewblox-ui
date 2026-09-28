<script setup lang="ts">
import { ChainItem } from '@/plugins/spark/types';

interface Props {
  items: ChainItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  show: [id: string];
}>();
</script>

<template>
  <!-- One row of a block chain: steps with arrows between them -->
  <div class="chain-row row no-wrap items-center">
    <template
      v-for="(item, idx) in items"
      :key="`${item.id}-${item.channel}`"
    >
      <!-- A link that is not in effect has a dimmed arrow; a disabled block is faded -->
      <q-icon
        v-if="idx > 0"
        name="mdi-chevron-right"
        :class="item.active ? 'text-grey-5' : 'text-grey-7'"
      >
        <q-tooltip v-if="!item.active">
          {{ items[idx - 1].name }} does not drive {{ item.name }} now
        </q-tooltip>
      </q-icon>
      <div
        :class="[
          'q-px-xs rounded-borders',
          item.current ? 'current-step text-primary text-bold' : 'clickable',
          { 'fade-5': !item.enabled },
        ]"
        @click="emit('show', item.id)"
      >
        <q-tooltip>
          {{ item.name }}{{ item.enabled ? '' : ' (disabled)' }}
        </q-tooltip>
        {{ item.label }}
        <!-- Only the type of the current block is bold -->
        <span
          v-if="item.value"
          class="text-grey-5 text-weight-regular"
        >
          {{ item.value }}
        </span>
      </div>
      <div
        v-if="item.alternatives.length"
        class="q-px-xs rounded-borders clickable text-grey-5"
      >
        +{{ item.alternatives.length }}
        <q-menu>
          <q-list dense>
            <q-item
              v-for="alt in item.alternatives"
              :key="alt.id"
              v-close-popup
              clickable
              @click="emit('show', alt.id)"
            >
              <q-item-section>
                <q-item-label>{{ alt.id }}</q-item-label>
                <q-item-label caption>{{ alt.type }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </template>
  </div>
</template>

<style lang="sass" scoped>
.chain-row
  height: 32px

  // Steps keep their width: the chain scrolls instead
  > *
    flex-shrink: 0
</style>
