export type AuthActionHook<T, E> = [
  (email: string, password: string) => Promise<void>,
  T | undefined,
  boolean,
  E | undefined
];
