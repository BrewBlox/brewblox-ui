import { useSidebarStore } from '@/store/sidebar';
import { createDialog } from '@/utils/dialog';
import { nanoid } from 'nanoid';
import { SidebarDirectory } from './types';

export function startChangeDirectoryTitle(
  directory: Maybe<SidebarDirectory>,
): void {
  if (!directory) {
    return;
  }
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Change directory title',
      message: `Choose a new name for ${directory.title}`,
      modelValue: directory.title,
    },
  }).onOk((title: string) => {
    const sidebarStore = useSidebarStore();
    sidebarStore.saveDirectory({ ...directory, title });
  });
}

export function startRemoveDirectory(directory: Maybe<SidebarDirectory>): void {
  if (!directory) {
    return;
  }
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove directory',
      message: `Are you sure you wish to remove ${directory.title}?`,
      noBackdropDismiss: true,
    },
  }).onOk(async () => {
    const sidebarStore = useSidebarStore();
    await sidebarStore.removeDirectory(directory).catch(() => {});
  });
}

export function startCreateDirectory(parent: Maybe<string>): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: 'New directory',
      title: 'Add sidebar directory',
      message: 'Use this to group dashboards, layouts, and services',
    },
  }).onOk((title) => {
    const sidebarStore = useSidebarStore();
    sidebarStore.createDirectory({
      id: nanoid(),
      parent,
      title,
    });
  });
}
