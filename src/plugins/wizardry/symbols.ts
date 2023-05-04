import { InjectionKey, Ref } from 'vue';

export const DialogTitleKey: InjectionKey<Ref<string>> = Symbol();
export const ActiveDashboardIdKey: InjectionKey<string | null> = Symbol();
export const ActiveServiceIdKey: InjectionKey<string | null> = Symbol();
