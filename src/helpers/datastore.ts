import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';

export const checkDatastore = (): void => {
  const addr = `${HOST}/datastore`;

  const request = new XMLHttpRequest();
  request.open('GET', addr, true);
  request.onerror = () => notify.error({
    timeout: 0,
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
