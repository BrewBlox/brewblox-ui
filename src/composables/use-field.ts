import { VueClassProp, VueStyleProp } from 'quasar';
import { computed, ComputedRef, getCurrentInstance } from 'vue';

export interface UseFieldProps {
  tag?: string;
  title?: string;
  label?: string;
  message?: string;
  html?: boolean;
  tooltip?: string;
  readonly?: boolean;
  rules?: InputRule[];
  tagProps?: AnyDict;
  tagClass?: VueClassProp;
  tagStyle?: VueStyleProp;
  dialogProps?: AnyDict;
}

export interface UseFieldComponent {
  activeSlots: ComputedRef<string[]>;
}

export interface UseFieldComposable {
  defaultProps: InferDefaults<UseFieldProps>;
  setup(): UseFieldComponent;
}

const fieldSlots = [
  'prepend',
  'append',
  'before',
  'after',
  'error',
  'hint',
  'counter',
  'loading',
  'label',
];

export const useField: UseFieldComposable = {
  defaultProps: {
    tag: 'span',
    title: 'Edit value',
    label: '',
    message: '',
    html: false,
    tooltip: '',
    readonly: false,
    rules: () => [],
    tagProps: () => ({}),
    tagClass: '',
    tagStyle: '',
    dialogProps: () => ({}),
  },
  setup() {
    const instance = getCurrentInstance()!;

    // Forgetting to set default props will not result in a type error
    // We can do a static assert here to nag the dev
    console.assert(
      instance.props.tag !== undefined,
      '`tag` prop undefined. Did you forget to use `useField.defaultProps`?',
    );

    const activeSlots = computed<string[]>(() =>
      Object.keys(instance.slots).filter((s) => fieldSlots.includes(s)),
    );

    return {
      activeSlots,
    };
  },
};
