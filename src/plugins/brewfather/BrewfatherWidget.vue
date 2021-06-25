<script lang="ts">
import takeRight from 'lodash/takeRight';
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
import { createDialog } from '@/utils/dialog';

import { brewfatherStore } from './store';
import { BrewfatherCurrentState, BrewfatherRecipe, BrewfatherWidget } from './types';


export default defineComponent({
  name: 'BrewfatherWidget',
  setup() {
    const { context } = useContext.setup();
    const {
      widget,
    } = useWidget.setup<BrewfatherWidget>();

    const recipes = computed<BrewfatherRecipe[]>(
      () => brewfatherStore.recipes,
    );

    const messages = computed<string[]>(
      () => takeRight(brewfatherStore.messages, 5),
    );

    const state = computed<BrewfatherCurrentState | null>(
      () => brewfatherStore.state,
    );

    function loadRecipe(): void {
      createDialog({
        component: 'SelectDialog',
        componentProps: {
          title: 'Select recipe',
          message: 'Pick a recipe to load in the Brewfather service',
          selectOptions: recipes.value.map(v => ({
            label: v.name,
            value: v.id,
          })),
        },
      })
        .onOk((id: string | null) => {
          if (id) {
            brewfatherStore.loadRecipe(id);
          }
        });
    }

    function startMash(): void {
      brewfatherStore.startMash();
    }

    brewfatherStore.fetchRecipes();

    return {
      context,
      widget,
      recipes,
      messages,
      state,
      loadRecipe,
      startMash,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <div class="widget-body">
      <div class="text-secondary text-italic text-big">
        Messages
      </div>
      <div
        v-for="msg in messages"
        :key="msg"
        class="q-my-sm"
      >
        {{ msg }}
      </div>
      <div class="text-secondary text-italic text-big">
        Recipes
      </div>
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="q-my-md"
      >
        {{ recipe.name }}
      </div>

      <div class="row q-gutter-sm">
        <q-btn unelevated label="Load recipe" @click="loadRecipe" />
        <q-btn unelevated label="Start mash" @click="startMash" />
      </div>
    </div>
  </Card>
</template>
