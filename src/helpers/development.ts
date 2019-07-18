import { Notify } from 'quasar';

/*
* The development configuration uses HTTP for the UI, and HTTPS for the backend.
* This means that if the self-signed certificate exception expires for the backend,
* the UI itself still renders - it just can't access the backend.
*
* The solution is to navigate to the backend, and accept the certificate again.
* We can't do so automatically, but we can open a new tab that triggers the browser warning.
*
* Using a notification reminds the dev why this is happening,
* and ensures that the new tab doesn't fall afoul of built-in popup blockers.
*/
export const checkDevCertificate = () => {
  if (process.env.NODE_ENV === 'development') {
    const HOST = process.env.VUE_APP_API_URI || window.location.origin;
    const addr = `${HOST}/datastore`;

    const request = new XMLHttpRequest();
    request.open('GET', addr, true);
    request.onerror = () => Notify.create({
      timeout: 0,
      color: 'error',
      icon: 'warning',
      message: 'Backend check failed',
      actions: [
        {
          label: 'Open window',
          textColor: 'white',
          handler: () => window.open(addr, '_blank'),
        },
        {
          label: 'Dismiss',
          textColor: 'white',
        },
      ],
    });
    request.send();
  }
};
