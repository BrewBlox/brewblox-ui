import isObject from 'lodash/isObject';

import { BlockOrIntfType, SerializedLink } from '../types';
import { MetaClass } from './MetaClass';

export function isSerializedLink(obj: any): obj is SerializedLink {
  return isObject(obj) && (obj as SerializedLink).__metaclass === 'Link';
}

export class Link implements MetaClass {
  public readonly metaclass = 'Link';
  public id: string | null;
  public type: BlockOrIntfType | null;
  public driven: boolean;

  public constructor(raw: SerializedLink);
  public constructor(id: string | null);
  public constructor(id: string | null, type: BlockOrIntfType | null);
  public constructor(id: string | null, type: BlockOrIntfType | null, driven: boolean);
  public constructor(link: string | SerializedLink | null, type: BlockOrIntfType | null = null, driven = false) {
    if (isSerializedLink(link)) {
      this.id = link.id;
      this.type = link.type;
      this.driven = link.driven ?? false;
    }
    else {
      this.id = link;
      this.type = type;
      this.driven = driven;
    }
  }

  public get value(): string | null {
    return this.id;
  }

  public set value(v: string | null) {
    this.id = v;
  }

  public get postfix(): string {
    const typeStr = `${this.type ?? ''}`;
    return this.driven
      ? `<${typeStr},driven>`
      : `<${typeStr}>`;
  }

  public toString(): string {
    return this.id || '<not set>';
  }

  public toJSON(): SerializedLink {
    return {
      __metaclass: this.metaclass,
      id: this.id,
      type: this.type,
      driven: this.driven || undefined,
    };
  }

  public copy(): Link {
    return new Link(this.toJSON());
  }

  public isEqual(other: Link): boolean {
    // Type does not have to be equal
    return other
      && this.id === other.id
      && this.driven === other.driven;
  }
}
