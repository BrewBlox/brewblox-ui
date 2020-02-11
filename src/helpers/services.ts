import isString from 'lodash/isString';

import { createDialog } from '@/helpers/dialog';
import notify from '@/helpers/notify';
import router from '@/router';
import { ServiceFeature } from '@/store/features';
import { Service, serviceStore, ServiceStub } from '@/store/services';


export async function startCreateService(stub: ServiceStub, feature: ServiceFeature): Promise<void> {
  if (serviceStore.serviceIds.includes(stub.id)) {
    notify.error(`Service '${stub.id}' already exists`);
  }
  else if (isString(feature.wizard)) {
    createDialog({
      component: 'WizardDialog',
      initialWizard: feature.wizard,
      initialProps: { stub },
    });
  }
  else {
    const service = await feature.wizard(stub);
    await serviceStore.appendService(service);
    notify.done(`Added ${feature.title} '${service.id}'`);
    router.push(`/service/${service.id}`);
  }
}


export function startChangeServiceTitle(service: Service): void {
  createDialog({
    title: 'Change service Title',
    message: "Change your service's display name",
    cancel: true,
    prompt: {
      model: service.title,
      type: 'text',
    },
  })
    .onOk(async newTitle => {
      const oldTitle = service.title;
      if (!newTitle || oldTitle === newTitle) {
        return;
      }

      await serviceStore.saveService({ ...service, title: newTitle });
      notify.done(`Renamed service '${oldTitle}' to '${newTitle}'`);
    });
}

export function startRemoveService(service: Service): void {
  createDialog({
    title: 'Remove service',
    message: `Are you sure you want to remove ${service.title}?`,
    ok: 'Confirm',
    cancel: 'Cancel',
  })
    .onOk(() => {
      if (router.currentRoute.path === `/service/${service.id}`) {
        router.replace('/');
      }
      serviceStore.removeService(service);
    });
}
