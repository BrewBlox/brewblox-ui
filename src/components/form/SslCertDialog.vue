<script setup lang="ts">
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { HOST, IS_FIREFOX, IS_IOS, IS_SAFARI } from '@/const';

type BrowserKind = 'chrome' | 'firefox' | 'safari' | 'ios';

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
          title="Install SSL Certificate"
        />
      </template>

      <q-card-section>
        <p>
          HTTPS connections are encrypted using SSL certificates, signed by a
          Certificate Authority (CA) to make them trustworthy. SSL certificates
          are linked to a domain (eg. <b>brewblox.com</b>). Before signing a
          certificate, a CA must validate that the certificate and the domain
          are owned by the same person. By default, Brewblox is not accessible
          from the internet. A CA can't validate a local network address it
          can't reach.
        </p>
        <p>
          To use HTTPS in a local network, Brewblox creates a
          <b>self-signed certificate</b>. When a browser sees an unknown
          self-signed certificate, it shows a warning page. On iOS devices, the
          WebSockets used by Brewblox will not work at all.
        </p>
        <p>
          To fix both problems, you can download and install your Brewblox
          certificate. This will tell your browser to trust this specific
          certificate. It will not trust certificates from other Brewblox
          systems, just this one. Select your platform below, and follow the
          instructions.
        </p>
        <p>
          <b>
            Android does not support the installation of self-signed
            certificates.
          </b>
        </p>
      </q-card-section>

      <q-separator />

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
      </q-tabs>
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
        <q-tab-panel name="safari">
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
              Click "Allow" when prompted about downloading a configuration
              profile
            </li>
            <li>Open the "Settings" app</li>
            <li>Underneath the user details, tap "Profile Downloaded"</li>
            <li>Tap the "Install" button</li>
            <li>If prompted, enter your passcode</li>
            <li>A warning is shown. Tap "Install"</li>
            <li>A second prompt is shown. Tap "Install" again</li>
            <li>Tap "Done"</li>
            <li>Open the "Settings" app</li>
            <li>Go to "General > About > Certificate Trust Settings"</li>
            <li>
              Under "Enable Full Trust for Root Certificates", find the new
              certificate
            </li>
            <li>Enable the toggle button next to the certificate</li>
            <li>Tap "Continue" when prompted</li>
            <li>Reload the Brewblox UI page in your browser</li>
          </ul>
        </q-tab-panel>
      </q-tab-panels>
    </Card>
  </q-dialog>
</template>
