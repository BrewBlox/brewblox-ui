import { Block } from 'brewblox-proto/ts';
import { DialogChainObject } from 'quasar';
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

export interface WizardDialogResult extends DialogChainObject {
  onOk(callback: (output: WizardOutput) => void): WizardDialogResult;
}
