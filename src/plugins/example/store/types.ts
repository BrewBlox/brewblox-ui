export interface Message {
  url: string;
  ok: boolean;
  content: string | any;
}

export interface ExampleState {
  messages: Message[];
}
