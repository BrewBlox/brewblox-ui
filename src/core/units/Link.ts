export default class Link {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  toJSON(): string {
    return this.id;
  }
}
