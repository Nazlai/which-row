import { useEffect, useRef } from "react";

export function useWorker(path: URL) {
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    if (window.Worker) {
      const worker = new Worker(path, { type: "module" });
      workerRef.current = worker;
    }
  }, []);

  return workerRef;
}
