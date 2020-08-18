import { DialogChainObject } from 'quasar';

import { Block } from '@/plugins/spark/types';
import { Dashboard, Widget } from '@/store/dashboards';

export interface WizardOutput {
  dashboard?: Dashboard | null;
  block?: Block | null;
  widget?: Widget | null;
}

export interface WizardDialogResult extends DialogChainObject {
  onOk(callback: ((output: WizardOutput) => void)): WizardDialogResult;
}
