import { Widget } from '@/store/widgets';

export interface RenderedItem {
  widget: Widget;
  component: string;
  error?: string;
}
