import { read } from '@/helpers/dynamic-store';
import { RootState, RootStore } from '@/store/state';
import { GetterTree } from 'vuex';
import { ExampleState, Message } from './state';

// Standard declaration of VueX getters
export const getters: GetterTree<ExampleState, RootState> = {
  messages: (state: ExampleState): Message[] => state.messages,
};

// Note: we are using the read() function from the dynamic-store helper
// This adds a required moduleId argument when getting the value
// Example call:
//    const currentMessages: Message[] = messages(this.$store, MODULE_ID)
export const messages = read(getters.messages);

// Default VueX getters do not accept any arguments
// It may be useful to declare helper functions that filter or modify getter results
// Do not make them too heavy: getter results are cached, but this function is not
export const filteredMessages = (
  store: RootStore,
  moduleId: string,
  filter: (message: Message) => boolean,
): Message[] =>
  messages(store, moduleId)
    .filter(filter);
