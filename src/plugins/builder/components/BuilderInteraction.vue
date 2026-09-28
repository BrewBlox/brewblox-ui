<script setup lang="ts">
import {
  computed,
  CSSProperties,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
import { InteractableKey, PlaceholderKey } from '../symbols';

interface Props {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  /**
   * Handled as a property instead of an emitted event
   * to allow for presence checks.
   */
  onInteract?: (evt: MouseEvent) => unknown;
}

const props = withDefaults(defineProps<Props>(), {
  width: 50,
  height: 50,
  x: 0,
  y: 0,
  onInteract: undefined,
});

const placeholder = inject(PlaceholderKey, false);
const interactionAllowed = inject(
  InteractableKey,
  computed(() => false),
);

const style = computed<CSSProperties>(() => {
  const styleObj: CSSProperties = {};

  if (interactionAllowed.value) {
    styleObj.pointerEvents = 'auto';

    if (props.onInteract != null) {
      styleObj.cursor = 'pointer';
    }
  }

  return styleObj;
});

function interact(evt: MouseEvent): void {
  if (interactionAllowed.value) {
    props.onInteract?.(evt);
  }
}

/**
 * Menus in the slot are anchored to this element.
 * In Chromium, Quasar positions them with CSS anchor positioning,
 * and Chromium does not resolve an anchor inside an SVG foreignObject:
 * the menu would open outside the window.
 * While Quasar names this element as an anchor,
 * an empty element with the same box and name stands in for it
 * at the start of the body, before the menu.
 */
const interactionRef = ref<HTMLElement>();
let anchorProxy: HTMLElement | null = null;

// The stand-in is fixed in the window: it moves along when the page scrolls
// or the window is resized, for as long as it exists.
function followAnchor(follow: boolean): void {
  if (follow) {
    window.addEventListener('scroll', syncAnchorProxy, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', syncAnchorProxy, { passive: true });
  } else {
    window.removeEventListener('scroll', syncAnchorProxy, { capture: true });
    window.removeEventListener('resize', syncAnchorProxy);
  }
}

function removeAnchorProxy(): void {
  if (anchorProxy) {
    anchorProxy.remove();
    anchorProxy = null;
    followAnchor(false);
  }
}

function syncAnchorProxy(): void {
  const el = interactionRef.value;
  const name = el?.style.getPropertyValue('anchor-name');
  if (!el || !name) {
    removeAnchorProxy();
    return;
  }
  if (anchorProxy == null) {
    anchorProxy = document.createElement('div');
    followAnchor(true);
  }
  const { left, top, width, height } = el.getBoundingClientRect();
  Object.assign(anchorProxy.style, {
    position: 'fixed',
    pointerEvents: 'none',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  anchorProxy.style.setProperty('anchor-name', name);
  if (document.body.firstChild !== anchorProxy) {
    document.body.prepend(anchorProxy);
  }
}

const anchorObserver = new MutationObserver(syncAnchorProxy);

onMounted(() => {
  if (interactionRef.value) {
    anchorObserver.observe(interactionRef.value, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }
});

onBeforeUnmount(() => {
  anchorObserver.disconnect();
  removeAnchorProxy();
});
</script>

<template>
  <g
    v-if="!placeholder"
    class="interaction"
  >
    <rect
      v-bind="{ x, y, width, height }"
      class="interaction-highlight"
    />
    <foreignObject v-bind="{ x, y, width, height }">
      <div
        ref="interactionRef"
        class="fit"
        :style="style"
        @click="interact"
      >
        <slot />
      </div>
    </foreignObject>
  </g>
</template>
