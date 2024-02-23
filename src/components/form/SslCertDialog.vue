<script setup lang="ts">
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { HOST, IS_ANDROID, IS_FIREFOX, IS_IOS, IS_SAFARI } from '@/const';

type BrowserKind = 'chrome' | 'firefox' | 'mac' | 'ios' | 'android';

withDefaults(defineProps<UseDialogProps>(), {
  ...useDialog.defaultProps,
  title: 'Download SSL Certificate',
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();

const activeTab = ref<BrowserKind>('chrome');

if (IS_IOS) {
  activeTab.value = 'ios';
} else if (IS_ANDROID) {
  activeTab.value = 'android';
} else if (IS_SAFARI) {
  activeTab.value = 'mac';
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
          are linked to a domain name. Before signing a certificate, a public CA
          will validate that the certificate and the domain are owned by the
          same person. By default, Brewblox is not accessible from the internet.
          A public CA can't validate a local network address it can't reach.
        </p>
        <p>
          To use HTTPS in a local network, Brewblox creates its own CA for each
          install. Because this CA is not yet known to the browser, a warning
          page is shown for certificates signed by this CA. On iOS, a
          long-standing bug will cause the UI to be non-functional even after
          accepting the browser warning.
        </p>
        <p>
          To fix both problems, you can download and install your Brewblox CA
          certificate. This will tell your browser to trust the CA unique to
          your Brewblox install. Select your platform below, and follow the
          instructions.
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
          name="mac"
          label="MacOS"
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
        <q-tab-panel name="mac">
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
        <q-tab-panel name="android">
          <p>
            Android settings can vary between releases and vendors. The below
            instructions use stock Android 13 as reference.
          </p>
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
            <li>Open the "Settings" app</li>
            <li>Select "Security &amp; Privacy"</li>
            <li>Select "More security settings"</li>
            <li>Select "Encryption &amp; credentials"</li>
            <li>Select "Install a certificate"</li>
            <li>Select "CA certificate"</li>
            <li>Tap "Install anyway" in the warning screen</li>
            <li>Select "minica.pem.crt" under "Recent files"</li>
            <li>Reload the Brewblox UI page in your browser</li>
          </ul>
        </q-tab-panel>
      </q-tab-panels>
    </Card>
  </q-dialog>
</template>
