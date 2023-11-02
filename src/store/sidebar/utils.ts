import { SidebarFolder } from './types';
import { useSidebarStore } from '@/store/sidebar';
import { createDialog } from '@/utils/dialog';
import { nanoid } from 'nanoid';

export function startChangeFolderTitle(folder: Maybe<SidebarFolder>): void {
  if (!folder) {
    return;
  }
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Change folder title',
      message: `Choose a new name for ${folder.title}`,
      modelValue: folder.title,
    },
  }).onOk((title: string) => {
    const sidebarStore = useSidebarStore();
    sidebarStore.saveFolder({ ...folder, title });
  });
}

export function startRemoveFolder(folder: Maybe<SidebarFolder>): void {
  if (!folder) {
    return;
  }
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove folder',
      message: `Are you sure you wish to remove ${folder.title}?`,
    },
    noBackdropDismiss: true,
  }).onOk(async () => {
    const sidebarStore = useSidebarStore();
    await sidebarStore.removeFolder(folder).catch(() => {});
  });
}

export function startCreateFolder(parentFolder: Maybe<string>): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: 'New folder',
      title: 'Add sidebar folder',
      message: 'Use this to group dashboards, layouts, and services',
    },
  }).onOk((title) => {
    const sidebarStore = useSidebarStore();
    sidebarStore.createFolder({
      id: nanoid(),
      parentFolder,
      title,
    });
  });
}
