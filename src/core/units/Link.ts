export default class Link {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  toString(): string {
    return this.id;
  }

  toJSON(): string {
    return this.id;
  }
}
