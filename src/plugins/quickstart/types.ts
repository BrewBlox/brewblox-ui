import { BuilderLayout } from '@/plugins/builder/types';
import { Block } from '@/plugins/spark/types';
import { DisplayOpts } from '@/plugins/spark/types';
import { PidBlock } from '@/shared-types';
import { Widget } from '@/store/widgets';

export interface PinChannel {
  arrayId: string;
  pinId: number;
  pinName: string;
}

export interface DisplayBlock {
  blockId: string;
  opts: Partial<DisplayOpts>;
}

export interface QuickstartConfig {
  prefix: string;
  serviceId: string;
  dashboardId: string;
  dashboardTitle: string;
  names: AnyDict;
  layouts: BuilderLayout[];
  widgets: Widget[];
  createdBlocks: Block[];
  changedBlocks: Block[];
  renamedBlocks: { [old: string]: string };
  displayedBlocks: DisplayBlock[];
}

export type QuickstartAction = (config: any) => Awaitable<unknown>;

export type PidConfig = Pick<PidBlock['data'], 'kp' | 'ti' | 'td'>
