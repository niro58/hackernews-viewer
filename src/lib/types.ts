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

export type HnItemType = "job" | "story" | "comment" | "poll" | "pollopt"
export type StoryFilter = "top" | "best" | "new" | "bookmark"
export const storyFilter: StoryFilter[] = ["best", "top", "new"]
export type HnItem = {
  id: number;
  deleted?: true;
  type: HnItemType
  by: string;
  time: number;
  text?: string;
  dead?: true;
  parent?: number;
  poll?: string;
  kids: number[]
  url: string;
  score: number;
  title: string;
  parts?: number[];
  descendants?: number;
}
export type HnUser = {
  id: string;
  created: number;
  karma: number;
  about: string;
  submitted: number[];
}
