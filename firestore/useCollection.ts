import { useEffect, useMemo } from 'react';
import { snapshotToData } from './helpers';
import {
  CollectionHook,
  CollectionDataHook,
  Data,
  DataOptions,
  OnceOptions,
  OnceDataOptions,
  Options,
} from './types';
import { useIsEqualRef, useLoadingValue } from '../util';
import { DocumentData, Query, QuerySnapshot } from 'firebase/firestore';

export const useCollection = <T = DocumentData>(
  query?: Query | null,
  options?: Options
): CollectionHook<T> => {
  return useCollectionInternal<T>(true, query, options);
};

export const useCollectionOnce = <T = DocumentData>(
  query?: Query<T> | null,
  options?: OnceOptions
): CollectionHook<T> => {
  return useCollectionInternal<T>(false, query, options);
};

export const useCollectionData = <
  T = DocumentData,
  IDField extends string = '',
  RefField extends string = ''
>(
  query?: Query | null,
  options?: DataOptions<T>
): CollectionDataHook<T, IDField, RefField> => {
  return useCollectionDataInternal<T, IDField, RefField>(true, query, options);
};

export const useCollectionDataOnce = <
  T = DocumentData,
  IDField extends string = '',
  RefField extends string = ''
>(
  query?: Query | null,
  options?: OnceDataOptions<T>
): CollectionDataHook<T, IDField, RefField> => {
  return useCollectionDataInternal<T, IDField, RefField>(false, query, options);
};

const useCollectionInternal = <T = DocumentData>(
  listen: boolean,
  query?: any | null,
  options?: Options & OnceOptions
) => {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    QuerySnapshot,
    Error
  >();
  const ref = useIsEqualRef(query, reset);

  useEffect(() => {
    if (!ref.current) {
      setValue(undefined);
      return;
    }
    if (listen) {
      const listener =
        options && options.snapshotListenOptions
          ? ref.current.onSnapshot(
              options.snapshotListenOptions,
              setValue,
              setError
            )
          : ref.current.onSnapshot(setValue, setError);

      return () => {
        listener();
      };
    } else {
      ref.current
        .get(options ? options.getOptions : undefined)
        .then(setValue)
        .catch(setError);
    }
  }, [ref.current]);

  const resArray: CollectionHook<T> = [
    value as QuerySnapshot<T>,
    loading,
    error,
  ];
  return useMemo(() => resArray, resArray);
};

const useCollectionDataInternal = <
  T = DocumentData,
  IDField extends string = '',
  RefField extends string = ''
>(
  listen: boolean,
  query?: Query | null,
  options?: DataOptions<T> & OnceDataOptions<T>
): CollectionDataHook<T, IDField, RefField> => {
  const idField = options ? options.idField : undefined;
  const refField = options ? options.refField : undefined;
  const snapshotOptions = options ? options.snapshotOptions : undefined;
  const transform = options ? options.transform : undefined;
  const [snapshots, loading, error] = useCollectionInternal<T>(
    listen,
    query,
    options
  );
  const values = useMemo(
    () =>
      (snapshots
        ? snapshots.docs.map((doc) =>
            snapshotToData<T>(
              doc,
              snapshotOptions,
              idField,
              refField,
              transform
            )
          )
        : undefined) as Data<T, IDField, RefField>[],
    [snapshots, snapshotOptions, idField, refField, transform]
  );

  const resArray: CollectionDataHook<T, IDField, RefField> = [
    values,
    loading,
    error,
  ];
  return useMemo(() => resArray, resArray);
};
