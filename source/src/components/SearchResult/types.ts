import type { ResultType } from "./enum";

export type ISearchResult = { type: ResultType; row: string };

export interface SearchResultProps {
  result: ISearchResult;
}
