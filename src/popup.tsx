import { useEffect, useState } from "react"

import BookmarkList from "~components/BookmarkList"

import "~style.css"

interface Bookmark {
  url: string
  name: string
}

function IndexPopup() {
  const [allowBookmark, setAllowBookmark] = useState(false)
  const [currentTabTitle, setCurrentTabTitle] = useState("")
  const [currentTabUrl, setCurrentTabUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function init() {
      const chatUrlPattern = /^https:\/\/chatgpt\.com\/c\/[\w-]+$/

      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const currentUrl = tabs[0].url || ""
        if (chatUrlPattern.test(currentUrl)) {
          setAllowBookmark(true)
        }
      })

      chrome.storage.sync.get("bookmarks", (result) => {
        if (result.bookmarks) {
          setBookmarks(result.bookmarks)
        }
      })

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        setCurrentTabTitle(tabs[0].title || "")
        setCurrentTabUrl(tabs[0].url || "")
      })
    }
    init()
  }, [])

  useEffect(() => {
    const bookmarked = bookmarks.some(
      (bookmark) => bookmark.url === currentTabUrl
    )
    setIsBookmarked(bookmarked)
  }, [currentTabUrl, bookmarks])

  useEffect(() => {
    if (searchQuery) {
      const filtered = bookmarks.filter((bookmark) =>
        bookmark.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredBookmarks(filtered)
    } else {
      setFilteredBookmarks(bookmarks)
    }
  }, [searchQuery, bookmarks])

  async function addBookmark(url: string, name: string) {
    const newBookmark = { url, name }
    setBookmarks((prev) => {
      const updatedBookmarks = [...prev, newBookmark]
      chrome.storage.sync.set({ bookmarks: updatedBookmarks })
      return updatedBookmarks
    })
  }

  async function removeBookmark(url: string) {
    setBookmarks((prev) => {
      const updatedBookmarks = prev.filter((bookmark) => bookmark.url !== url)
      chrome.storage.sync.set({ bookmarks: updatedBookmarks })
      return updatedBookmarks
    })
  }

  return (
    <div className="w-[500px] h-[600px] text-base px-5">
      <h1 className="font-black text-2xl text-center pt-6">
        Chat GPT Bookmarks
      </h1>
      <div className="py-4">
        {isBookmarked ? (
          <button
            className="w-full py-2 bg-red-800 text-white text-sm font-medium rounded-md"
            onClick={() => {
              removeBookmark(currentTabUrl)
            }}>
            Remove This Chat
          </button>
        ) : (
          <button
            disabled={!allowBookmark}
            className="w-full py-2 bg-zinc-800 text-white text-sm font-medium rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={() => {
              addBookmark(currentTabUrl, currentTabTitle)
            }}>
            Bookmark This Chat
          </button>
        )}
        <p className="text-sm font-medium text-center text-zinc-400 py-1">or</p>
        <input
          type="text"
          placeholder="Search for a chat"
          className="w-full p-2 border border-zinc-300 rounded-md font-medium text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <BookmarkList
        data={filteredBookmarks}
        setData={setBookmarks}
        searchQuery={searchQuery}
      />
    </div>
  )
}

export default IndexPopup
