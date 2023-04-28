import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { getCurrentInstance, PropType } from 'vue';
import { WizardOutput } from '../types';

export interface UseWizardProps {
  activeDashboardId: {
    type: PropType<string | null>;
    default: null;
  };
}

export type UseWizardEmits = ['back', 'close', 'done', 'title'];

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
      type: null as unknown as PropType<string | null>,
      default: null,
    },
  },
  emits: ['back', 'close', 'done', 'title'],
  setup() {
    const instance = getCurrentInstance()!;

    function onBack(): void {
      instance.emit('back');
    }

    function onClose(): void {
      instance.emit('close');
    }

    function onDone(output: WizardOutput): void {
      if (output.block) {
        createBlockDialog(output.block);
      } else if (output.widget) {
        createDialog({
          component: 'WidgetDialog',
          componentProps: {
            widgetId: output.widget.id,
            mode: 'Full',
          },
        });
      }

      instance.emit('done', output);
    }

    function setDialogTitle(title: string): void {
      instance.emit('title', title);
    }

    return {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
    };
  },
};
