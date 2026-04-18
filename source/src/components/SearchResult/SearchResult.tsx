import { ResultType } from "./enum";
import type { SearchResultProps } from "./types";

export function SearchResult(props: SearchResultProps) {
  if (props.result.type === ResultType.IDLE) {
    return <div className="h-8" />;
  }

  const message = formatMessage(props.result.type);

  return (
    <p className="text-2xl h-8">
      {message} {props.result.row}
    </p>
  );
}

function formatMessage(type: Exclude<ResultType, ResultType.IDLE>) {
  const messages = {
    [ResultType.SINGLE]: "You're at table",
    [ResultType.MULTIPLE]: "You may be at tables",
    [ResultType.NONE]: "Record not found",
  };

  return messages[type];
}
