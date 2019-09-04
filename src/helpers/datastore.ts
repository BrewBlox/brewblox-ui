import { Notify } from 'quasar';

export const checkDatastore = (): void => {
  const HOST = process.env.VUE_APP_API_URI || window.location.origin;
  const addr = `${HOST}/datastore`;

  const request = new XMLHttpRequest();
  request.open('GET', addr, true);
  request.onerror = () => Notify.create({
    timeout: 0,
    color: 'negative',
    icon: 'error',
    message: 'Failed to access the datastore',
    actions: [
      {
        label: 'Reload page',
        textColor: 'white',
        handler: () => location.reload(),
      },
      {
        label: 'Dismiss',
        textColor: 'white',
      },
    ],
  });
  request.send();
};
