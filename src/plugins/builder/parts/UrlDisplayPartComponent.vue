<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/UrlDisplay';
import { usePart } from '../composables';
import { LABEL_KEY, URL_KEY } from '../const';
import { isAbsoluteUrl } from '@/utils/url';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const { settings, width, height, bordered } = usePart.setup();

const url = computed<string>(() => settings.value[URL_KEY] || '');

const titleText = computed<string>(
  () => settings.value[LABEL_KEY] || url.value || 'Url Display',
);

function interact(): void {
  if (url.value) {
    if (isAbsoluteUrl(url.value)) {
      window.open(url.value, '_blank');
    } else {
      useRouter().push(url.value);
    }
  }
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject v-bind="{ width, height }">
      <div
        class="fit text-bold text-center q-mt-sm grid-label"
        style="text-decoration: underline; font-size: 130%"
      >
        {{ titleText }}
      </div>
    </foreignObject>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
    />
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="interact"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <TextMenuContent
            :settings-key="LABEL_KEY"
            label="Edit label"
          />
          <TextMenuContent
            :settings-key="URL_KEY"
            label="Edit link"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
