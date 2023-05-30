import * as d3 from 'd3';
import defaults from 'lodash/defaults';
import isEqual from 'lodash/isEqual';
import isFinite from 'lodash/isFinite';
import toFinite from 'lodash/toFinite';
import { provide, Ref, ref, watch } from 'vue';
import { ZoomTransformKey } from '../symbols';

export interface UseSvgZoomDimensions {
  width: number;
  height: number;
}

export interface UseSvgZoomOpts {
  dragEnabled?: Ref<boolean>;
  wheelEnabled?: Ref<boolean>;
}

const defaultOpts = (): Required<UseSvgZoomOpts> => ({
  dragEnabled: ref(true),
  wheelEnabled: ref(true),
});

export interface UseSvgZoomComponent {
  svgRef: Ref<SVGElement | undefined>;
  svgContentRef: Ref<SVGGElement | undefined>;
  activeTransform: Ref<d3.ZoomTransform | undefined>;
  resetZoom(): void;
}

export interface UseSvgZoomComposable {
  setup(
    dimensions: Ref<UseSvgZoomDimensions>,
    opts?: UseSvgZoomOpts,
  ): UseSvgZoomComponent;
}

export const useSvgZoom: UseSvgZoomComposable = {
  setup(dimensions: Ref<UseSvgZoomDimensions>, opts = {}): UseSvgZoomComponent {
    const svgRef = ref<SVGElement>();
    const svgContentRef = ref<SVGGElement>();
    const { dragEnabled, wheelEnabled } = defaults(opts, defaultOpts());
    const activeTransform = ref<d3.ZoomTransform>();

    provide(ZoomTransformKey, activeTransform);

    function transformCenter(scaleOffset = -0.05): d3.ZoomTransform {
      if (!svgRef.value) {
        return d3.zoomIdentity.translate(0, 0).scale(1);
      }
      const svg = svgRef.value.getBoundingClientRect();
      const content = dimensions.value;
      const scale =
        (1 + scaleOffset) *
        Math.min(svg.width / content.width, svg.height / content.height, 1);
      return d3.zoomIdentity
        .translate(
          toFinite(svg.width - content.width * scale) / 2,
          toFinite(svg.height - content.height * scale) / 2,
        )
        .scale(scale);
    }

    const gridZoom = d3.zoom<SVGElement, unknown>().on('zoom', function (evt) {
      const { transform } = evt;
      if (isFinite(transform.x + transform.y + transform.k)) {
        activeTransform.value = transform;
        svgContentRef.value?.setAttribute('transform', transform);
      }
    });

    function resetZoom(): void {
      if (svgRef.value) {
        d3.select(svgRef.value)
          .transition()
          .duration(750)
          .call(gridZoom.transform, transformCenter());
      }
    }

    function applyHandlers(): void {
      if (!svgRef.value) {
        return;
      }

      const selection = d3
        .select(svgRef.value)
        .call(gridZoom)
        .on('dblclick.zoom', resetZoom)
        .on('contextmenu', (evt: MouseEvent) => {
          // Allow for custom context menu handlers
          if (!evt.shiftKey) {
            evt.preventDefault();
          }
        });

      if (!wheelEnabled.value) {
        selection.on('wheel.zoom', null);
      }

      if (!dragEnabled.value) {
        // Applied by d3.
        // Remove to re-enable drag-based scrolling in widgets
        svgRef.value.style.touchAction = '';

        selection
          .on('mousedown.zoom', null)
          .on('mouseup.zoom', null)
          .on('touchstart.zoom', null)
          .on('touchmove.zoom', null)
          .on('touchend.zoom', null)
          .on('touchcancel.zoom', null);
      }
    }

    watch([svgRef, dragEnabled, wheelEnabled], () => applyHandlers(), {
      immediate: true,
    });

    watch(
      [svgContentRef, dimensions],
      ([el, size], [prevEl, prevSize]) => {
        if (el && (!prevEl || !isEqual(size, prevSize))) {
          el.setAttribute('width', `${size.width}`);
          el.setAttribute('height', `${size.height}`);
          resetZoom();
        }
      },
      { immediate: true },
    );

    return {
      svgRef,
      svgContentRef,
      activeTransform,
      resetZoom,
    };
  },
};
