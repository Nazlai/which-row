import { useWorker } from "../../hooks/useWorker";
import { Message } from "../../worker/enum";
import type {
  LoadCsvMessage,
  RetrieveWithKeyMessage,
} from "../../worker/webworker";

export function usePyodideWorker(path: string) {
  const worker = useWorker(new URL(path, import.meta.url));

  function findRow(key: string) {
    worker.current?.postMessage(createRetrieveWithKeyMessage(key));
  }

  function uploadCsv(file: File) {
    worker.current?.postMessage(createUploadCsvMessage(file));
  }

  return { worker, findRow, uploadCsv };
}

function createRetrieveWithKeyMessage(key: string): RetrieveWithKeyMessage {
  return {
    message: Message.RETRIEVE_WITH_KEY,
    key,
  };
}

function createUploadCsvMessage(file: File): LoadCsvMessage {
  return {
    message: Message.LOAD_CSV,
    file,
  };
}
