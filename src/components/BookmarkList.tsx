import React from "react"

interface Bookmark {
  url: string
  name: string
}

interface BookmarkListProps {
  data: Bookmark[]
  setData: React.Dispatch<React.SetStateAction<Bookmark[]>>
  searchQuery: string
}

export default function BookmarkList({
  data,
  setData,
  searchQuery
}: BookmarkListProps) {
  function removeBookmark(url: string) {
    setData((prev) => prev.filter((bookmark) => bookmark.url !== url))
    chrome.storage.sync.set({
      bookmarks: data.filter((bookmark) => bookmark.url !== url)
    })
  }

  return (
    <div>
      <h2 className="font-bold text-lg">Your Bookmarked Chats</h2>
      <div className="pt-2 space-y-1">
        {data.map((bookmark, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href={bookmark.url}
                target="_blank"
                className="font-medium hover:underline">
                {bookmark.name}
              </a>
            </div>
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => removeBookmark(bookmark.url)}>
              Remove
            </button>
          </div>
        ))}
        {data.length === 0 ? (
          <div className="text-sm font-medium text-gray-500">
            {searchQuery ? "No results found" : "No bookmarks yet"}
          </div>
        ) : null}
      </div>
    </div>
  )
}
