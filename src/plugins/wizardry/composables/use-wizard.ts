import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { getCurrentInstance, inject, PropType, Ref } from 'vue';
import {
  ActiveDashboardIdKey,
  ActiveServiceIdKey,
  DialogTitleKey,
} from '../symbols';
import { WizardOutput } from '../types';

export interface UseWizardProps {
  activeDashboardId: {
    type: PropType<string | null>;
    default: null;
  };
}

export type UseWizardEmits = ['back', 'close', 'done'];

export interface UseWizardComponent {
  dialogTitle: Ref<string>;
  activeDashboardId: string | null;
  activeServiceId: string | null;
  onBack(): void;
  onClose(): void;
  onDone(output: WizardOutput): void;
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
  emits: ['back', 'close', 'done'],
  setup() {
    const instance = getCurrentInstance()!;
    const dialogTitle = inject(DialogTitleKey)!;
    const activeDashboardId = inject(ActiveDashboardIdKey)!;
    const activeServiceId = inject(ActiveServiceIdKey)!;

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

    return {
      dialogTitle,
      activeDashboardId,
      activeServiceId,
      onBack,
      onClose,
      onDone,
    };
  },
};
