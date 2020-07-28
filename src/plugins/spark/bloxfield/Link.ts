import isObject from 'lodash/isObject';

import { BlockOrIntfType, JSONLink } from '../types';
import { JSBloxField } from './BloxField';

export function isJSONLink(obj: any): obj is JSONLink {
  return isObject(obj)
    && (obj as JSONLink).__bloxtype === 'Link'
    && !('toJSON' in obj);
}

export function isLink(obj: any): obj is Link {
  return isObject(obj)
    && (obj as Link).__bloxtype === 'Link'
    && 'toJSON' in obj;
}

export class Link implements JSBloxField {
  public readonly __bloxtype = 'Link';
  public id: string | null;
  public type: BlockOrIntfType | null;
  public driven: boolean;

  public constructor(raw: JSONLink);
  public constructor(id: string | null);
  public constructor(id: string | null, type: BlockOrIntfType | null);
  public constructor(id: string | null, type: BlockOrIntfType | null, driven: boolean);
  public constructor(link: string | JSONLink | null, type: BlockOrIntfType | null = null, driven = false) {
    if (isJSONLink(link)) {
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

  public toJSON(): JSONLink {
    return {
      __bloxtype: 'Link',
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
