export default class Link {
  id: string | null;
  type: string | null;

  constructor(id: string | null, type: string | null = null) {
    this.id = id;
    this.type = type;
  }

  toString(): string {
    return this.id || '<not set>';
  }

  toJSON(): string | null {
    return this.id;
  }
}
