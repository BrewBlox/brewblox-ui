import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import blueprints from '@/plugins/builder/blueprints';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderPart } from '@/plugins/builder/types';
import PartWrapper from '../components/PartWrapper.vue';

const part: BuilderPart = {
  id: 'tube',
  type: 'StraightTube',
  x: 1,
  y: 1,
  rotate: 0,
  settings: {},
  width: 1,
  height: 1,
};

function mountWrapper(props: {
  selectable?: boolean;
  selected?: boolean;
}): VueWrapper {
  const Host = defineComponent({
    setup: () => () => h('svg', [h(PartWrapper, { part, ...props })]),
  });
  return mount(Host, { attachTo: document.body });
}

describe('PartWrapper', () => {
  beforeEach(() => {
    useBuilderStore().blueprints = Object.values(blueprints);
  });

  it('renders no selection rects where parts are not selected', () => {
    const wrapper = mountWrapper({});
    expect(wrapper.find('.builder-part').exists()).toBe(true);
    expect(wrapper.find('.selection-overlay').exists()).toBe(false);
    expect(wrapper.find('.selection-highlight').exists()).toBe(false);
    wrapper.unmount();
  });

  it('renders both selection rects for a selectable part', () => {
    const wrapper = mountWrapper({ selectable: true });
    expect(wrapper.find('.selection-overlay').exists()).toBe(true);
    expect(wrapper.find('.selection-highlight').exists()).toBe(true);
    wrapper.unmount();
  });

  it('highlights a selected part', () => {
    const wrapper = mountWrapper({ selected: true });
    expect(wrapper.find('.selection-overlay').exists()).toBe(false);
    expect(wrapper.find('.selection-highlight').exists()).toBe(true);
    wrapper.unmount();
  });
});
