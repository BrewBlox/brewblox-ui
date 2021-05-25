import { getCurrentInstance, PropType } from 'vue';

import { WizardOutput } from '../types';

export interface UseWizardProps {
  activeDashboardId: {
    type: PropType<string>,
    default: null,
  }
}

export type UseWizardEmits = [
  'back',
  'close',
  'done',
  'title',
]

export interface UseWizardComponent {
  onBack(): void;
  onClose(): void;
  onDone(output: WizardOutput): void;
  setDialogTitle(title: string): void;
}

export interface UseWizardComposable {
  props: UseWizardProps;
  emits: UseWizardEmits;
  setup(): UseWizardComponent;
}

export const useWizard: UseWizardComposable = {
  props: {
    activeDashboardId: {
      type: String,
      default: null,
    },
  },
  emits: [
    'back',
    'close',
    'done',
    'title',
  ],
  setup() {
    const { emit } = getCurrentInstance()!;

    function onBack(): void {
      emit('back');
    }
    function onClose(): void {
      emit('close');
    }
    function onDone(output: WizardOutput): void {
      emit('done', output);
    }
    function setDialogTitle(title: string): void {
      emit('title', title);
    }

    return {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
    };
  },
};
