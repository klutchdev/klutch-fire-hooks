export type AuthActionHook<T, E> = [
  (email: string, password: string) => void,
  T | undefined,
  boolean,
  E | undefined
];
