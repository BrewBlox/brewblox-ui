import { commit } from '@/helpers/dynamic-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { ExampleState, Message } from './state';

// standard declaration of VueX mutations
export const mutations: MutationTree<ExampleState> = {
  addMessage: (state: ExampleState, message: Message) =>
    Vue.set(state, 'messages', [...state.messages, message]),

  removeMessage: (state: ExampleState, index: number) =>
    Vue.set(state, 'messages', state.messages.filter((m, idx) => idx !== index)),
};

// Note: we are using the commit() function from the dynamic-store helper
// This adds a required moduleId argument
// Example call:
//    addMessage(this.$store, MODULE_ID, { url: '/datastore', content: {}, ok: true })
export const addMessage = commit(mutations.addMessage);
export const removeMessage = commit(mutations.removeMessage);
