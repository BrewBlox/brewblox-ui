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
  dialogRef: Ref<QDialog | null>;
  onDialogHide: () => void;
  onDialogOK: (payload?: T) => void;
  onDialogCancel: () => void;
  /**
   * Adds a step within the dialog to the navigation stack:
   * the back button calls `onBack` before it closes the dialog.
   */
  pushRouteStep: (onBack: () => void) => void;
  /** The number of steps pushed with pushRouteStep and not yet undone */
  routeSteps: Readonly<Ref<number>>;
  /** Undoes the last step, as the back button does */
  routeStepBack: () => void;
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

    const router = useRouter();
    const hashId = `.${nanoid(6)}.`;
    // Steps within the dialog, pushed after its own entry; the newest last
    const steps: { hashId: string; onBack: () => void }[] = [];
    const routeSteps = ref<number>(0);
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
    provide(InvalidateKey, () => onDialogHide());

    // We want the dialog to be part of the navigation stack.
    // This lets mobile users close dialogs by using the back button.
    // This requires two actions:
    // - Push a new page with a unique ID in hash when dialog opens.
    // - Close dialog if the ID disappears from hash (because eg. back button was pressed).
    function pushHash(id: string): Promise<unknown> {
      return router.push({
        query: { ...router.currentRoute.value.query },
        hash: (router.currentRoute.value.hash || '#') + id,
      });
    }

    function setupRouteHash(): void {
      pushHash(hashId)
        .then(() => nextTick())
        .then(() => {
          cancelWatcher.value = watch(
            () => router.currentRoute.value,
            (newRoute) => {
              if (!newRoute.hash.includes(hashId)) {
                cancelWatcher.value();
                onDialogHide();
                return;
              }
              // The back button undoes the steps within the dialog first
              while (
                steps.length &&
                !newRoute.hash.includes(steps[steps.length - 1].hashId)
              ) {
                steps.pop()!.onBack();
                routeSteps.value = steps.length;
              }
            },
          );
        })
        .catch(() => {});
    }

    function pushRouteStep(onBack: () => void): void {
      const step = { hashId: `.${nanoid(6)}.`, onBack };
      steps.push(step);
      routeSteps.value = steps.length;
      pushHash(step.hashId).catch(() => {});
    }

    // Dialogs can be closed manually, or by using the back button.
    // If closed manually, we need to clean up the current route.
    // Dialogs are not guaranteed to be closed in a LIFO order.
    function teardownRouteHash(): void {
      const hash = router.currentRoute.value.hash;
      const ids = [hashId, ...steps.map((step) => step.hashId)];

      if (hash.endsWith(ids[ids.length - 1])) {
        // Dialog was last to be opened - we can go back to undo the stack pushes.
        cancelWatcher.value();
        router.go(-ids.length);
      } else if (ids.some((id) => hash.includes(id))) {
        // Dialog was not last to be opened.
        // We want to clear the dialog IDs,
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
          hash: ids.reduce((acc, id) => acc.replaceAll(id, ''), hash),
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
      pushRouteStep,
      routeSteps,
      routeStepBack: () => router.back(),
      dialogOpts: {
        noRouteDismiss: true,
        noBackdropDismiss: true,
      },
    };
  },
};
