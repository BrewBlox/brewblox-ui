import { StoreObject } from 'brewblox-proto/ts';

export interface SidebarDirectory extends StoreObject {
  title: string;
  parent?: string | null;
}
