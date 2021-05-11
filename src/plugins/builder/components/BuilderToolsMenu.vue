<script lang="ts">
import * as d3 from 'd3';
import { defineComponent, onMounted, PropType, ref } from 'vue';

import { useGlobals } from '@/composables';

import { BuilderModeName, builderModes, builderTools } from '../const';


export default defineComponent({
  name: 'BuilderToolsMenu',
  props: {
    mode: {
      type: String as PropType<BuilderModeName>,
      required: true,
    },
  },
  emits: [
    'update:mode',
    'use',
  ],
  setup() {
    const { dense } = useGlobals.setup();
    const toolbarRef = ref<SVGForeignObjectElement>();
    const menuOpen = ref(true);

    const dragHandler = d3.drag<SVGForeignObjectElement, XYPosition>()
      .subject(function () {
        const t = d3.select(this);
        return {
          x: Number(t.attr('x')),
          y: Number(t.attr('y')),
        };
      })
      .on('drag', function () {
        d3.select(this)
          .attr('x', d3.event.x)
          .attr('y', d3.event.y);
        menuOpen.value = false;
      });

    onMounted(() => {
      d3.select(toolbarRef.value!)
        .datum({ x: 0, y: 0 })
        .call(dragHandler);
    });

    return {
      builderModes,
      builderTools,
      dense,
      toolbarRef,
      menuOpen,
    };
  },
});
</script>

<template>
  <foreignObject
    ref="toolbarRef"
    class="column toolbar"
    x="20"
    y="20"
    width="80"
    height="50"
    @wheel.stop
  >
    <q-btn-dropdown
      v-model="menuOpen"
      unelevated
      icon="mdi-tools"
      color="secondary"
      class="q-pa-none fit"
      persistent
      menu-anchor="bottom left"
      menu-self="top left"
    >
      <q-list>
        <!-- <q-menu persistent auto-close> -->
        <ActionSubmenu label="Modes">
          <ActionItem
            v-for="opt in builderModes"
            :key="'mode-' + opt.value"
            :active="mode === opt.value"
            :icon="opt.icon"
            :label="opt.label"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="$emit('update:mode', opt.value)"
          />
        </ActionSubmenu>
        <ActionSubmenu label="Tools">
          <ActionItem
            v-for="tool in builderTools"
            :key="'tool-' + tool.value"
            :icon="tool.icon"
            :label="tool.label"
            :inset-level="0.2"
            style="min-height: 0px"
            @click="$emit('use', tool.value)"
          >
            <q-item-section v-if="!dense" side class="text-uppercase">
              {{ tool.shortcut }}
            </q-item-section>
          </ActionItem>

          <slot name="tools" />
        </ActionSubmenu>
      </q-list>
      <!-- </q-menu> -->
    </q-btn-dropdown>
  </foreignObject>
</template>
