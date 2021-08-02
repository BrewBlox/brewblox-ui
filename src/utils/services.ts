import isString from 'lodash/isString';
import { Router } from 'vue-router';

import { featureStore } from '@/store/features';
import { Service, serviceStore, ServiceStub } from '@/store/services';

import { createDialog } from './dialog';
import { notify } from './notify';


export async function startCreateService(stub: ServiceStub, router: Maybe<Router> = null): Promise<void> {
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
    if (router) {
      router.push(`/service/${service.id}`);
    }
  }
}

export function startChangeServiceTitle(service: Maybe<Service>): void {
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

export function startRemoveService(service: Maybe<Service>, router: Router): void {
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
      if (router.currentRoute.value.path === `/service/${service.id}`) {
        router.replace('/');
      }
      serviceStore.removeService(service);
    });
}
