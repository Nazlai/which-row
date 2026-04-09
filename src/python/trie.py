from typing import TypeVar, Generic

T = TypeVar("T")


class TrieNode:
    def __init__(self):
        self.terminal = False
        self.children = {}
        self.val = []


class Trie:
    def __init__(self):
        self.root = None

    def insert(self, word: str, val: Generic[T] = None):
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
