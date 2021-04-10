export type {
  BloxField,
  Link,
  Quantity,
  BlockOrIntfType,
} from '@/shared-types';
import { BloxField } from '@/shared-types';

export interface JSBloxField extends BloxField {
  postfix: string;
  toJSON(): BloxField;
}
