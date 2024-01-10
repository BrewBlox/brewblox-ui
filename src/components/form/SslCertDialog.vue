<script setup lang="ts">
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { HOST, IS_FIREFOX, IS_IOS, IS_SAFARI } from '@/const';

type BrowserKind = 'chrome' | 'firefox' | 'safari' | 'ios' | 'android';

withDefaults(defineProps<UseDialogProps>(), {
  ...useDialog.defaultProps,
  title: 'Download SSL Certificate',
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();

const activeTab = ref<BrowserKind>('chrome');

if (IS_IOS) {
  activeTab.value = 'ios';
} else if (IS_SAFARI) {
  activeTab.value = 'safari';
} else if (IS_FIREFOX) {
  activeTab.value = 'firefox';
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    no-backdrop-dismiss
    @hide="onDialogHide"
  >
    <Card>
      <template #toolbar>
        <Toolbar
          icon="mdi-shield-lock"
          title="Download SSL Certificate"
        />
      </template>

      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          name="chrome"
          label="Chrome"
        />
        <q-tab
          name="firefox"
          label="Firefox"
        />
        <q-tab
          name="safari"
          label="Safari"
        />
        <q-tab
          name="ios"
          label="iOS"
        />
        <q-tab
          name="android"
          label="Android"
        />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="activeTab">
        <q-tab-panel name="chrome">
          <ul>
            <li>
              <a
                outline
                :href="`${HOST}/static/minica.pem`"
                target="_blank"
                style="color: white"
              >
                Click here to download the <b>minica.pem</b> file
              </a>
            </li>
            <li>Open Chrome settings</li>
            <li>Select "Privacy and security" in the sidebar</li>
            <li>Select "Security"</li>
            <li>Select "Manage certificates"</li>
            <li>Select the "Authorities" tab</li>
            <li>Click the "Import" button</li>
            <li>Select the <b>minica.pem</b> file you downloaded</li>
            <li>
              Check the "Trust this certificate for identifying websites" option
            </li>
            <li>Click the "OK" button</li>
            <li>Close Chrome settings</li>
            <li>Reload the Brewblox UI page</li>
          </ul>
        </q-tab-panel>
        <q-tab-panel name="firefox">
          <ul>
            <li>
              <a
                outline
                :href="`${HOST}/static/minica.pem`"
                target="_blank"
                style="color: white"
              >
                Click here to download the <b>minica.pem</b> file
              </a>
            </li>
            <li>Open Firefox settings</li>
            <li>Select "Privacy and security" in the sidebar</li>
            <li>Scroll down to the "Security" header</li>
            <li>Click the "View Certificates" button</li>
            <li>Select the "Authorities" tab</li>
            <li>Click the "Import" button</li>
            <li>Select the <b>minica.pem</b> file you downloaded</li>
            <li>Select the "Trust this CA to identify websites" option</li>
            <li>Click the "OK" button</li>
            <li>Close Firefox settings</li>
            <li>Reload the Brewblox UI page</li>
          </ul>
        </q-tab-panel>
        <q-tab-panel name="Safari">
          <ul>
            <li>
              <a
                outline
                :href="`${HOST}/static/minica.der`"
                target="_blank"
                style="color: white"
              >
                Click here to download the <b>minica.der</b> file
              </a>
            </li>
            <li>
              Open the directory in which you downloaded the
              <b>minica.der</b> file
            </li>
            <li>Double click the <b>minica.der</b> file</li>
            <li>Select the "System keychain" option</li>
            <li>Open the "Keychain Access" program</li>
            <li>Select "System keychain"</li>
            <li>Select the "minica.der" certificate</li>
            <li>Select "File > Get Info"</li>
            <li>Expand the "Trust" section</li>
            <li>Change "Secure Sockets Layer (SSL)" value to "Always Trust"</li>
            <li>Close the dialog and enter your password</li>
            <li>Reload the Brewblox UI page in your browser</li>
          </ul>
        </q-tab-panel>
        <q-tab-panel name="ios">
          TODO. Maybe
          https://support.n4l.co.nz/s/article/Installing-an-SSL-Certificate-on-an-iOS-Device-Manually
        </q-tab-panel>
        <q-tab-panel name="android">
          Sadly, Android does not support custom certificates.
        </q-tab-panel>
      </q-tab-panels>
    </Card>
  </q-dialog>
</template>
