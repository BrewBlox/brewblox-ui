import { nanoid } from 'nanoid';
import { QDialog, QDialogOptions, useDialogPluginComponent } from 'quasar';
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { ContextKey, InvalidateKey } from '@/symbols';

export interface UseDialogProps {
  title?: string;
  message?: string;
  html?: boolean;
}

export type UseDialogEmits = {
  ok: [payload?: any];
  hide: [];
};

export interface UseDialogComponent<T> {
  dialogRef: Ref<QDialog | undefined>;
  onDialogHide: () => void;
  onDialogOK: (payload?: T) => void;
  onDialogCancel: () => void;
  dialogOpts: Partial<QDialogOptions>;
}

export interface UseDialogComposable {
  defaultProps: InferDefaults<UseDialogProps>;
  setup<T = any>(): UseDialogComponent<T>;
}

export const useDialog: UseDialogComposable = {
  defaultProps: {
    title: '',
    message: '',
    html: false,
  },
  setup<T = any>(): UseDialogComponent<T> {
    const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
      useDialogPluginComponent<T>();

    const hashId = `.${nanoid(6)}.`;
    const cancelWatcher = ref<() => void>(() => {});

    // Will be overridden if this dialog is showing a widget
    // Used for all other menus and edit dialogs
    provide(
      ContextKey,
      reactive({
        container: 'Dialog',
        size: 'Fixed',
        mode: 'Basic',
      } as const),
    );

    // Lets all nested elements declare that the dialog should be closed immediately
    provide(InvalidateKey, onDialogHide);

    // We want the dialog to be part of the navigation stack.
    // This lets mobile users close dialogs by using the back button.
    // This requires two actions:
    // - Push a new page with a unique ID in hash when dialog opens.
    // - Close dialog if the ID disappears from hash (because eg. back button was pressed).
    function setupRouteHash(): void {
      const router = useRouter();
      router
        .push({
          query: { ...router.currentRoute.value.query },
          hash: (router.currentRoute.value.hash || '#') + hashId,
        })
        .then(() => nextTick())
        .then(() => {
          cancelWatcher.value = watch(
            () => router.currentRoute.value,
            (newRoute) => {
              if (!newRoute.hash.includes(hashId)) {
                cancelWatcher.value();
                onDialogHide();
              }
            },
          );
        })
        .catch(() => {});
    }

    // Dialogs can be closed manually, or by using the back button.
    // If closed manually, we need to clean up the current route.
    // Dialogs are not guaranteed to be closed in a LIFO order.
    function teardownRouteHash(): void {
      const router = useRouter();
      const hash = router.currentRoute.value.hash;

      if (hash.endsWith(hashId)) {
        // Dialog was last to be opened - we can go back to undo the stack push.
        cancelWatcher.value();
        router.back();
      } else if (hash.includes(hashId)) {
        // Dialog was not last to be opened.
        // We want to clear the dialog ID,
        // but can't remove a page from the middle of the navigation stack.
        // This means we'll have a bit of junk left on the stack after last dialog is closed.
        // It's not optimal, but usually won't be noticed by users.
        //
        // Ideally, we'd want to remove duplicate pages from the navigation stack.
        // For security/privacy reasons we can't inspect the stack
        // before calling `router.back()`.
        cancelWatcher.value();
        router.replace({
          query: { ...router.currentRoute.value.query },
          hash: hash.replaceAll(hashId, ''),
        });
      }
    }

    onMounted(() => setupRouteHash());
    onBeforeUnmount(() => teardownRouteHash());

    return {
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
      dialogOpts: {
        noRouteDismiss: true,
        noBackdropDismiss: true,
      },
    };
  },
};
