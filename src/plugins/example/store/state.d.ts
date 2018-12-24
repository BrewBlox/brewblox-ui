import { RootState } from '@/store/state';
import { ActionContext } from 'vuex';

export interface Message {
  url: string;
  ok: boolean;
  content: string | any;
}

export type ExampleState = {
  messages: Message[];
};

export type ExampleContext = ActionContext<ExampleState, RootState>;
