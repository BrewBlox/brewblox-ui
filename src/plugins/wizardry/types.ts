import { Block } from '@/plugins/spark/types';
import { Dashboard } from '@/store/dashboards';
import { Widget } from '@/store/widgets';

/**
 * Output from Wizard dialogs
 */
export interface WizardOutput {
  dashboard?: Dashboard | null;
  block?: Block | null;
  widget?: Widget | null;
}
