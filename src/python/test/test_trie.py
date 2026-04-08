import unittest
from ..trie import Trie


class TestTrie(unittest.TestCase):

    def testRetrieval(self):
        example = ("Hellen", 2)
        trie = Trie()
        trie.insert(example[0], example[1])
        self.assertEqual(trie.retrieve("Hellen"), 2)

    def testMultipleKey(self):
        examples = [("Hellen", 2), ("Hellen", 4), ("Hellen", 7)]
        trie = Trie()

        for i in examples:
            trie.insert(i[0], i[1])

        self.assertEqual(trie.retrieve("Hellen"), [2, 4, 7])

    def testInsertInvalid(self):
        trie = Trie()
        self.assertRaises(ValueError, trie.insert, "", "")

    def testOptionalValue(self):
        trie = Trie()
        trie.insert("tim")
        trie.insert("tim")
        self.assertEqual(trie.retrieve("tim"), [None, None])

    def testNotFound(self):
        trie = Trie()
        trie.insert("Hellen", 2)
        self.assertEqual(trie.retrieve("hellen"), None)
        self.assertEqual(trie.retrieve("Helle"), None)


if __name__ == "__main__":
    unittest.main()
