import { nanoid } from 'nanoid';
import { PropType } from 'vue';

import { useFeatureStore } from '@/store/features';

import {
  useWizard,
  UseWizardComponent,
  UseWizardEmits,
  UseWizardProps,
} from './use-wizard';

export interface UseWidgetWizardProps extends UseWizardProps {
  featureId: {
    type: PropType<string>;
    required: true;
  };
}

export type UseWidgetWizardEmits = UseWizardEmits;

export interface UseWidgetWizardComponent extends UseWizardComponent {
  widgetId: string;
  featureTitle: string;
  defaultWidgetSize: GridSize;
}

export interface UseWidgetWizardComposable {
  props: UseWidgetWizardProps;
  emits: UseWidgetWizardEmits;
  setup(featureId: string): UseWidgetWizardComponent;
}

export const useWidgetWizard: UseWidgetWizardComposable = {
  props: {
    ...useWizard.props,
    featureId: {
      type: String,
      required: true,
    },
  },
  emits: [...useWizard.emits],
  setup(featureId: string) {
    const widgetId = nanoid();
    const featureStore = useFeatureStore();
    const featureTitle = featureStore.widgetTitle(featureId);
    const defaultWidgetSize = featureStore.widgetSize(featureId);

    return {
      ...useWizard.setup(),
      widgetId,
      featureTitle,
      defaultWidgetSize,
    };
  },
};
