import { nanoid } from 'nanoid';
import { QDialogOptions, useDialogPluginComponent } from 'quasar';
import { nextTick, onBeforeMount, onBeforeUnmount, PropType, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';

import { WidgetContext } from '@/store/features';

export interface UseDialogProps {
  title: {
    type: PropType<string>,
    default: string,
  },
  message: {
    type: PropType<string>,
    default: string,
  },
  html: {
    type: PropType<boolean>,
    default: false,
  }
}

export type UseDialogEmits = string[];

export interface UseDialogComponent extends ReturnType<useDialogPluginComponent> {
  context: WidgetContext;
  dialogProps: Partial<QDialogOptions>;
}

export interface UseDialogComposable {
  props: UseDialogProps;
  emits: UseDialogEmits;
  setup(): UseDialogComponent;
}

export const useDialog: UseDialogComposable = {
  props: {
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    html: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    ...useDialogPluginComponent.emits,
  ],
  setup(): UseDialogComponent {
    const hashId = `.${nanoid(6)}.`;
    const {
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
    } = useDialogPluginComponent();

    // We want the dialog to be part of the navigation stack.
    // This lets mobile users close dialogs by using the back button.
    // This requires two actions on startup:
    // - Push a new page with unique ID in hash when dialog opens.
    // - If back button is pressed, the ID disappears from hash -> close dialog.
    const setupRouteHash = (): void => {
      const router = useRouter();
      router
        .push({ hash: router.currentRoute.value.hash + hashId })
        .then(() => nextTick())
        .then(() => watch(
          router.currentRoute,
          (newRoute) => {
            if (!newRoute.hash.includes(hashId)) {
              onDialogHide();
            }
          },
        ))
        .catch(() => { });
    };

    // Dialogs can be closed manually, or by using the back button.
    // If closed manually, we need to clean up the current route.
    // Dialogs are not guaranteed to be closed in a LIFO order.
    const teardownRouteHash = (): void => {
      const router = useRouter();
      const hash = router.currentRoute.value.hash;

      if (hash.endsWith(hashId)) {
        // Dialog was last to be opened - we can go back to undo the stack push.
        router.back();
      }
      else if (hash.includes(hashId)) {
        // Dialog was not last to be opened.
        // We want to clear the dialog ID,
        // but can't remove a page from the middle of the navigation stack.
        // This means we'll have a bit of junk left on the stack after last dialog is closed.
        // It's not optimal, but usually won't be noticed by users.
        //
        // Ideally, we'd want to remove duplicate pages from the navigation stack,
        // but for security/privacy reasons we can't inspect the stack before calling `router.back()`.
        router.replace({ hash: hash.replaceAll(hashId, '') });
      }
    };

    onBeforeMount(() => setupRouteHash());
    onBeforeUnmount(() => teardownRouteHash());

    return {
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
      dialogProps: {
        noRouteDismiss: true,
        noBackdropDismiss: true,
      },
      context: reactive({
        container: 'Dialog',
        size: 'Fixed',
        mode: 'Basic',
      }),
    };
  },
};
