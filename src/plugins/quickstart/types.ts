import { Block, GpioModuleChannel, PidBlock } from 'brewblox-proto/ts';
import { BuilderLayout } from '@/plugins/builder/types';
import { DisplayOpts } from '@/plugins/spark/types';
import { Widget } from '@/store/widgets';

export interface IoChannelAddress {
  blockId: string;
  name: string;
  channelId: number;
}

export interface GpioChange {
  blockId: string;
  modulePosition: number;
  channels: GpioModuleChannel[];
}

export interface QuickstartPatch<T extends Block> {
  blockId: string;
  patch: Partial<T['data']>;
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
  changedGpio: GpioChange[];
  createdBlocks: Block[];
  changedBlocks: QuickstartPatch<Block>[];
  renamedBlocks: { [old: string]: string };
  displayedBlocks: DisplayBlock[];
}

export type QuickstartAction = (config: any) => Awaitable<unknown>;

export type PidConfig = Pick<PidBlock['data'], 'kp' | 'ti' | 'td'>;
