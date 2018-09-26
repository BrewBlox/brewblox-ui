export default class Link {
  id: string | null;

  constructor(id: string | null) {
    this.id = id;
  }

  toString(): string {
    return this.id || '<not set>';
  }

  toJSON(): string | null {
    return this.id;
  }
}
