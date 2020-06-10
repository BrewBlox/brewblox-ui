<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import notify from '@/helpers/notify';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { previewWebhook } from '@/plugins/automation/store/preview-api';
import { WebhookImpl } from '@/plugins/automation/types';

@Component
export default class Webhook extends AutomationItemBase<WebhookImpl> {
  busy = false;

  get methodOpt(): SelectOption {
    return { label: this.impl.method, value: this.impl.method };
  }

  editUrl(): void {
    createDialog({
      component: 'InputDialog',
      parent: this,
      label: 'URL',
      title: 'Edit request URL',
      value: this.impl.url,
    })
      .onOk(url => {
        this.impl.url = url;
        this.save();
      });
  }

  editBody(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Body',
      title: 'Edit request body',
      value: this.impl.body,
    })
      .onOk(body => {
        this.impl.body = body;
        this.save();
      });
  }

  preview(): void {
    this.busy = true;
    previewWebhook(this.impl)
      .then(resp => notify.info(`${this.impl.url} responds '${resp.statusText}' / ${JSON.stringify(resp.data)}`))
      .finally(() => this.busy = false);
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      title="URL"
      label="URL"
      :readonly="false"
      class="col-grow"
      @click="editUrl"
    >
      {{ impl.url || 'Click to edit' }}
    </LabeledField>
    <SelectField
      :value="impl.method"
      :options="['GET', 'POST', 'PUT', 'PATCH', 'DELETE']"
      title="Method"
      label="Method"
      class="col-grow"
      @input="v => {impl.method = v; save()}"
    />

    <div class="col-break" />

    <LabeledField
      title="Message body"
      label="Message body"
      :readonly="false"
      class="col-grow"
      @click="editBody"
    >
      {{ impl.body || 'Click to edit' }}
    </LabeledField>
    <q-btn
      label="Try it!"
      :loading="busy"
      class="col-auto self-stretch"
      flat
      @click="preview"
    />
  </div>
</template>
