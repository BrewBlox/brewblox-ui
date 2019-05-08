import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';
import { Message } from './state';
import { getBackend, getExternal } from './api';

type FilterFunc = (message: Message) => boolean;

@Module({ store, namespaced: true })
export class ExampleModule extends VuexModule {
  private _messages: Message[] = [];

  public get messages(): Message[] {
    return this._messages;
  }

  // return a function that can return filtered messages based on input
  public get filteredMessages(): ((filter: FilterFunc) => Message[]) {
    return (filter) => this._messages.filter(filter);
  }

  @Mutation
  public addMessage(message: Message): void {
    this._messages.push(message);
  }

  @Mutation
  public removeMessage(index: number): void {
    this._messages = this._messages.filter((m, idx) => idx !== index);
  }

  @Action({ commit: 'addMessage' })
  public async fetchBackend(url: string): Promise<Message> {
    try {
      const content = await getBackend(url);
      return { url, content, ok: true };
    } catch (e) {
      return { url, content: e, ok: false };
    }
  }

  @Action({ commit: 'addMessage' })
  public async fetchExternal(url: string): Promise<Message> {
    try {
      const content = await getExternal(url);
      return { url, content, ok: true };
    } catch (e) {
      return { url, content: e, ok: false };
    }
  }
}

export default getModule(ExampleModule);
