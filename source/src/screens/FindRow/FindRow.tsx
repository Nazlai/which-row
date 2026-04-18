import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ChangeEvent } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Card } from "../../components/Card/Card";
import { ResultType } from "../../components/SearchResult/enum";
import { SearchResult } from "../../components/SearchResult/SearchResult";
import type { ISearchResult } from "../../components/SearchResult/types";
import { TextField } from "../../components/TextField/TextField";
import { UploadField } from "../../components/UploadField/UploadField";
// https://github.com/vitejs/vite/issues/11823
// eslint-disable-next-line import/default
import webWorkerUrl from "../../worker/webworker?worker&url";

import { schema, type Payload } from "./schema";
import { usePyodideWorker } from "./usePyodideWorker";

enum LoadState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  RESOLVED = "RESOLVED",
}

export function FindRow() {
  const methods = useForm({ resolver: zodResolver(schema) });
  const { worker, findRow, uploadCsv } = usePyodideWorker(webWorkerUrl);
  const [state, setState] = useState<ISearchResult>({
    type: ResultType.IDLE,
    row: "",
  });
  const [loadState, setLoadState] = useState(LoadState.IDLE);
  const [filename, setFilename] = useState("");

  useEffect(() => {
    // fixme
    // what if webworker fails to load
    if (worker.current) {
      worker.current?.addEventListener("message", function (message) {
        if (typeof message.data === "number") {
          setState({ type: ResultType.SINGLE, row: message.data.toString() });
        }

        if (Array.isArray(message.data)) {
          setState({ type: ResultType.MULTIPLE, row: message.data.join(",") });
        }

        if (!message.data) {
          setState({ type: ResultType.NONE, row: "" });
        }

        if (message.data === "loaded csv into trie") {
          setLoadState(LoadState.RESOLVED);
        }
      });
    }
  }, [worker]);

  function handleSubmit(values: Payload) {
    findRow(values.name);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      const csvFile = event.target.files[0];

      uploadCsv(csvFile);
      setLoadState(LoadState.LOADING);
      setFilename(csvFile.name);
    }
  }

  return (
    <>
      <Card>
        <h2 className="text-2xl mb-2">Upload csv file</h2>

        {filename ? (
          <p className="py-1">File: {filename}</p>
        ) : (
          <UploadField
            accept="text/csv"
            onChange={handleUpload}
            id="upload-csv"
          >
            <span className="rounded border inline-block px-2 py-1">
              Upload
            </span>
          </UploadField>
        )}
      </Card>

      {loadState === LoadState.RESOLVED ? (
        <Card>
          <FormProvider {...methods}>
            <form
              id="search-form"
              onSubmit={methods.handleSubmit(handleSubmit)}
              className="mb-2"
            >
              <label className="flex flex-col mb-4">
                <span className="inline-block mb-1">Search</span>
                <TextField name="name" />
              </label>

              <button
                type="submit"
                className="border border-neutral-900 px-2 py-1 rounded bg-zinc-100 text-neutral-900"
              >
                Submit
              </button>
            </form>
          </FormProvider>

          <SearchResult result={state} />
        </Card>
      ) : null}
    </>
  );
}
