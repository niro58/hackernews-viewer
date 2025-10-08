export type ResultClient<T> = Success<T> | Failure | NotAsked | Loading;
export type ResultFetch<T> = Success<T> | Failure;
export type NotAsked = { type: "NOT_ASKED" };
export type Loading = { type: "LOADING" };
export type Success<T> = {
  type: "SUCCESS";
  data: T;
};

export type Failure = {
  type: "FAILURE";
  error: string;
};