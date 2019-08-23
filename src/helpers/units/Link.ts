export default class Link {
  public id: string | null;
  public type: string | null;
  public driven: boolean;

  public constructor(id: string | null, type: string | null = null, driven = false) {
    this.id = id;
    this.type = type;
    this.driven = driven;
  }

  public get postfix(): string {
    const typeStr =
      this.type === null
        ? ''
        : this.type;
    return this.driven
      ? `<${typeStr},driven>`
      : `<${typeStr}>`;
  }

  public toString(): string {
    return this.id || '<not set>';
  }

  public toJSON(): string | null {
    return this.id;
  }

  public copy() {
    return new Link(this.id, this.type, this.driven);
  }

  public isEqual(other: Link) {
    // Type does not have to be equal
    return other
      && this.id === other.id
      && this.driven === other.driven;
  }
}
