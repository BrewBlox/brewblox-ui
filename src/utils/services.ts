import isString from 'lodash/isString';
import { useRouter } from 'vue-router';

import { featureStore } from '@/store/features';
import { Service, serviceStore, ServiceStub } from '@/store/services';
import { createDialog } from '@/utils/dialog';
import notify from '@/utils/notify';


export async function startCreateService(stub: ServiceStub, navigate = true): Promise<void> {
  const feature = featureStore.serviceById(stub.type);
  if (feature === null) {
    notify.error(`Unknown service type '${stub.type}'`);
    return;
  }
  if (serviceStore.serviceIds.includes(stub.id)) {
    notify.error(`Service <b>${stub.id}</b> already exists`);
    return;
  }

  if (isString(feature.wizard)) {
    createDialog({
      component: 'WizardDialog',
      componentProps: {
        initialWizard: feature.wizard,
        initialProps: { stub },
      },
    });
  }
  else {
    const service = await feature.wizard(stub);
    await serviceStore.appendService(service);
    notify.done(`Added ${feature.title} <b>${service.id}</b>`);
    if (navigate) {
      useRouter().push(`/service/${service.id}`);
    }
  }
}

export function startChangeServiceTitle(service: Service | null): void {
  if (!service) {
    return;
  }
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Rename service',
      message: 'This changes the service display name, not its unique identifier.',
      modelValue: service.title,
    },
  })
    .onOk(async (newTitle: string) => {
      const oldTitle = service.title;
      if (!newTitle || oldTitle === newTitle) {
        return;
      }

      await serviceStore.saveService({ ...service, title: newTitle });
      notify.done(`Renamed service to <b>${newTitle}</b>`);
    });
}

export function startRemoveService(service: Service | null): void {
  if (!service) {
    return;
  }
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove service',
      message: `Are you sure you want to remove <b>${service.title}</b>?`,
      html: true,
      ok: 'Confirm',
      cancel: 'Cancel',
    },
  })
    .onOk(() => {
      const router = useRouter();
      if (router.currentRoute.value.path === `/service/${service.id}`) {
        router.replace('/');
      }
      serviceStore.removeService(service);
    });
}
