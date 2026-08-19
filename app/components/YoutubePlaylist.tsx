import { useMemo, useState } from "react";
import { YouTubePlaylistResponse, YouTubePlaylistItem } from "@/utils/types";
import "dotenv/config";

export default function YoutubePlaylist() {
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
  const [playlistUrl, setPlaylistUrl] = useState("");

  const [playlist, setPlaylist] = useState<YouTubePlaylistResponse | null>(
    null,
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const songs = playlist?.items ?? [];

  const selectedCount = selectedIds.size;

  const allSelected = useMemo(() => {
    return songs.length > 0 && selectedCount === songs.length;
  }, [songs.length, selectedCount]);


  const handleFetchPlaylist = async () => {
    if (!playlistUrl.trim()) {
      setError("Please enter a YouTube playlist URL.");
      return;
    }

    setError("");

    const playlistLive = new URL(playlistUrl);
    console.log(`Playlist live URL ${playlistLive}`);

    if (!playlistLive) {
      setError("Please enter a valid YouTube playlist URL.");
      return;
    }

    const playlistId = playlistLive.searchParams.get("list");
    console.log(`Playlist ID ${playlistId}`);

    if (!playlistId) {
      setError("Please enter a valid YouTube playlist URL.");
      return;
    }

    setLoading(true);
    try {
      let data: YouTubePlaylistResponse | null = null;
      let nextPageToken = null;

      do {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;

        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const response = await fetch(url, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to load playlist");
        }

        const result = await response.json();
        if (!data) {
          data = result;
        } else {
          data.items = data.items.concat(result.items);
        }

        if (data!.items.length >= 100) break;

        nextPageToken = result.nextPageToken;
      } while (nextPageToken);

      setPlaylist(data);

      /*
       * Select all songs by default.
       *
       * We use the playlist item's ID as the selection key.
       * This is unique to the playlist item and is available at:
       *
       * item.id
       */
      setSelectedIds(new Set(data!.items.map((item) => item.id)));
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the playlist. Please check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select / deselect an individual song.
   */
  const toggleSong = (id: string) => {
    setSelectedIds((current) => {
      const updated = new Set(current);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  };

  /**
   * Select / deselect everything currently loaded.
   */
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(songs.map((item) => item.id)));
    }
  };

  /**
   * Continue with only the selected songs.
   */
  const handleContinue = () => {
    if (!playlist) return;

    const selectedSongs = playlist.items.filter((item) =>
      selectedIds.has(item.id),
    );

    console.log("Selected songs:", selectedSongs);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <svg
              className="h-7 w-7 text-red-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Import YouTube Playlist
          </h1>

          <p className="mt-2 max-w-2xl text-neutral-400">
            Enter a YouTube playlist link and select the songs you want to
            transfer to Spotify.
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          <label
            htmlFor="playlist-url"
            className="mb-2 block text-sm font-medium text-neutral-200"
          >
            YouTube Playlist URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="playlist-url"
              type="url"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetchPlaylist();
                }
              }}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none placeholder:text-neutral-600 transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />

            <button
              type="button"
              onClick={handleFetchPlaylist}
              disabled={loading}
              className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load Playlist"}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && !playlist && !error && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
              <svg
                className="h-8 w-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 18V5l12-2v13"
                />
                <circle cx="6" cy="18" r="3" strokeWidth={1.5} />
                <circle cx="18" cy="16" r="3" strokeWidth={1.5} />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-white">
              No playlist loaded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Paste a YouTube playlist URL above to see the songs available for
              transfer.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-green-500" />

            <h2 className="text-lg font-semibold text-white">
              Loading playlist
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Fetching songs from YouTube...
            </p>
          </div>
        )}

        {/* Playlist */}
        {!loading && playlist && (
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
            {/* Playlist Header */}
            <div className="flex flex-col gap-4 border-b border-neutral-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-white">Playlist Songs</h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {selectedCount} of {playlist.pageInfo.totalResults} songs
                  selected
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAll}
                className="self-start rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:bg-neutral-800 hover:text-white sm:self-auto"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Songs */}
            <div className="divide-y divide-neutral-800">
              {songs.map((item) => {
                const selected = selectedIds.has(item.id);

                const thumbnail =
                  item.snippet.thumbnails.medium?.url ??
                  item.snippet.thumbnails.high?.url ??
                  item.snippet.thumbnails.default?.url;

                const artist =
                  item.snippet.videoOwnerChannelTitle ??
                  item.snippet.channelTitle;

                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-4 px-6 py-4 transition ${
                      selected ? "bg-neutral-800/40" : "hover:bg-neutral-800/20"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSong(item.id)}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-green-500"
                    />

                    {/* Position */}
                    <span className="hidden w-6 shrink-0 text-center text-sm text-neutral-600 sm:block">
                      {item.snippet.position + 1}
                    </span>

                    {/* Thumbnail */}
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-14 w-24 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                        <svg
                          className="h-6 w-6 text-neutral-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 18V5l12-2v13"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Song Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">
                        {item.snippet.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-neutral-500">
                        {artist}
                      </p>
                    </div>

                    {/* Video ID */}
                    <span className="hidden text-xs text-neutral-600 lg:block">
                      {item.snippet.resourceId.videoId}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-4 border-t border-neutral-800 bg-neutral-950/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Ready to transfer?
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {selectedCount === 0
                    ? "Select at least one song to continue."
                    : `${selectedCount} song${
                        selectedCount === 1 ? "" : "s"
                      } will be transferred.`}
                </p>
              </div>

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={handleContinue}
                className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
