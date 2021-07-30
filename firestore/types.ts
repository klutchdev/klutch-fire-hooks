import { LoadingHook } from '../util';
import {
  DocumentData,
  DocumentReference,
  SnapshotListenOptions,
  QuerySnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

export type IDOptions<T> = {
  idField?: string;
  refField?: string;
  snapshotOptions?: SnapshotOptions;
  transform?: (val: any) => T;
};
export type Options = {
  snapshotListenOptions?: SnapshotListenOptions;
};
export type DataOptions<T> = Options & IDOptions<T>;
export type OnceOptions = {
  getOptions?: any;
};
export type OnceDataOptions<T> = OnceOptions & IDOptions<T>;
export type Data<
  T = DocumentData,
  IDField extends string = '',
  RefField extends string = ''
> = T & Record<IDField, string> & Record<RefField, DocumentReference<T>>;

export type CollectionHook<T = DocumentData> = LoadingHook<
  QuerySnapshot<T>,
  Error
>;
export type CollectionDataHook<
  T = DocumentData,
  IDField extends string = '',
  RefField extends string = ''
> = LoadingHook<Data<T, IDField, RefField>[], Error>;
