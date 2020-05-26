import PostFixed from '@/plugins/spark/units/PostFixed';

import { BlockOrIntfType } from '../types';

export default class Link extends PostFixed {
  public id: string | null;
  public type: BlockOrIntfType | null;
  public driven: boolean;

  public constructor(id: string | null, type: BlockOrIntfType | null = null, driven = false) {
    super();
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

  public serialized(key: string): [string, string | null] {
    return [`${key}${this.postfix}`, this.id];
  }

  public toString(): string {
    return this.id || '<not set>';
  }

  public toJSON(): string | null {
    return this.id;
  }

  public copy(): Link {
    return new Link(this.id, this.type, this.driven);
  }

  public isEqual(other: Link): boolean {
    // Type does not have to be equal
    return other
      && this.id === other.id
      && this.driven === other.driven;
  }
}
