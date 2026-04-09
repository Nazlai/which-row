import { loadPyodide, version as pyodideVersion } from "pyodide";
import type { PyodideAPI } from "pyodide";
import type { PyProxy } from "pyodide/ffi";

import { Message } from "./enum";

interface Trie {
  retrieve: (key: string) => number | PyProxy;
}

// fixme
// load custom python instead of pyodide.runPython
const pythonScript = `
import csv

def loadTrie():
  data = None
  with open("names.csv", "r", encoding="utf-8", newline="") as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    data = list(reader)

  trie = Trie()

  for index, row in enumerate(data):
      for name in row:
          trie.insert(name, index + 1)
  
  return trie

class TrieNode:
    def __init__(self):
        self.terminal = False
        self.children = {}
        self.val = []


class Trie:
    def __init__(self):
        self.root = None

    def insert(self, word: str, val = None):
        if word == "":
            raise ValueError("must insert a word")

        if self.root is None:
            self.root = TrieNode()

        ptr = self.root

        for char in word:
            if char not in ptr.children:
                ptr.children[char] = TrieNode()

            ptr = ptr.children[char]

        ptr.terminal = True
        ptr.val.append(val)

    def retrieve(self, word: str):
        ptr = self.root

        for char in word:
            if char in ptr.children:
                ptr = ptr.children[char]
            else:
                return None

        if not ptr.val:
            return None

        if ptr.terminal and len(ptr.val) == 1:
            head, *_ = ptr.val
            return head

        return ptr.val
`;

const pyodideReadyPromise = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
});
let trie: Trie | null = null;

export type LoadCsvMessage = { message: Message.LOAD_CSV; file: File };
export type RetrieveWithKeyMessage = {
  message: Message.RETRIEVE_WITH_KEY;
  key: string;
};

type WorkerMessage = LoadCsvMessage | RetrieveWithKeyMessage;

async function onWorkerMessage(event: MessageEvent<WorkerMessage>) {
  const workerMessage = event.data.message;
  const pyodide = await pyodideReadyPromise;
  await pyodide.runPythonAsync(pythonScript);

  switch (workerMessage) {
    case Message.LOAD_CSV:
      loadCsv(event.data.file, pyodide);
      return;
    case Message.RETRIEVE_WITH_KEY:
      retrieveWithKey(event.data.key, pyodide);
      return;
    default:
      throw new Error("event not recognized");
  }
}

async function loadCsv(file: File, pyodide: PyodideAPI) {
  const buffer = await file.arrayBuffer();
  const arrayBuffer = new Uint8Array(buffer);
  pyodide.FS.writeFile("names.csv", arrayBuffer, { encoding: "utf-8" });
  const loadTrie = pyodide.globals.get("loadTrie");
  trie = loadTrie();
  self.postMessage("loaded csv into trie");
}

function retrieveWithKey(key: string, pyodide: PyodideAPI) {
  if (!trie) {
    throw new Error("trie not initiated");
  }

  const data = trie.retrieve(key);

  if (data instanceof pyodide.ffi.PyProxy) {
    return self.postMessage(data.toJs());
  }

  return self.postMessage(data);
}

self.onmessage = onWorkerMessage;
