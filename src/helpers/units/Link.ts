export default class Link {
  id: string | null;
  type: string | null;
  driven: boolean;

  constructor(id: string | null, type: string | null = null, driven: boolean = false) {
    this.id = id;
    this.type = type;
    this.driven = driven;
  }

  get postfix(): string {
    const typeStr =
      this.type === null
        ? ''
        : this.type;
    return this.driven
      ? `<${typeStr},driven>`
      : `<${typeStr}>`;
  }

  toString(): string {
    return this.id || '<not set>';
  }

  toJSON(): string | null {
    return this.id;
  }
}
