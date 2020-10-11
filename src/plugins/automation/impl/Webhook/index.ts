import { matchesType } from '@/helpers/functional';
import { AutomationSpec, WebhookImpl } from '@/plugins/automation/types';

import Webhook from './Webhook.vue';

const type = 'Webhook';
const spec: AutomationSpec<WebhookImpl> = {
  type,
  title: 'Send HTTP request',
  component: Webhook,
  generate: () => ({
    type,
    url: 'http://datastore:5984',
    method: 'GET',
    body: '',
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  pretty: impl =>
    matchesType<WebhookImpl>(type, impl)
      ? `Send HTTP ${impl.method} request to ${impl.url}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
