import { StoreObject } from 'brewblox-proto/ts';

export interface SidebarFolder extends StoreObject {
  title: string;
  parentFolder?: string | null;
}
