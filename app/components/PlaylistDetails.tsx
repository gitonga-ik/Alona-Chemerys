import { useState, ChangeEvent, FormEvent } from "react";

export default function PlaylistDetails() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a playlist title.");
      return;
    }

    if (!image) {
      alert("Please select a playlist image.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("image", image);
      formData.append("public", String(isPublic));

      // Replace this with your actual API endpoint
      const response = await fetch("/api/playlists", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create playlist");
      }

      const data = await response.json();

      console.log("Playlist created:", data);

      alert("Playlist created successfully!");

      // Optional reset
      setTitle("");
      setImage(null);
      setPreviewUrl(null);
      setIsPublic(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating the playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Playlist
          </h1>

          <p className="mt-2 text-neutral-400">
            Create a new Spotify playlist and customize its appearance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl"
        >
          {/* Image */}
          <div className="mb-7">
            <label className="mb-3 block text-sm font-medium text-neutral-200">
              Playlist Cover
            </label>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <label
                htmlFor="playlist-image"
                className="group relative flex h-48 w-48 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-950 transition hover:border-green-500"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Playlist preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center px-4">
                    <svg
                      className="mx-auto mb-3 h-10 w-10 text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 015.828 0L19 16m-2-2l1.586-1.586a2 2 0 012.828 0L21 14m-9-9h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>

                    <span className="text-sm text-neutral-400">
                      Upload image
                    </span>
                  </div>
                )}

                <input
                  id="playlist-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="text-sm text-neutral-400">
                <p className="mb-1 text-neutral-200">
                  Choose a cover image
                </p>

                <p>PNG, JPG or WEBP</p>
                <p>Recommended: square image</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-7">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-neutral-200"
            >
              Playlist Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Late Night Vibes"
              maxLength={100}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Visibility */}
          <div className="mb-8">
            <div className="mb-3">
              <p className="text-sm font-medium text-neutral-200">
                Playlist Visibility
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Choose whether this playlist should be visible publicly.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
                  {isPublic ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        strokeWidth={1.8}
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M3 3l18 18M10.58 10.58A2 2 0 0012 15c1.105 0 2-.895 2-2 0-.522-.2-.997-.528-1.354M9.88 9.88A3 3 0 0115 14.12M6.228 6.228C4.61 7.41 3.37 9.12 2.458 12 3.732 16.057 7.523 19 12 19c1.61 0 3.13-.397 4.468-1.1M18.77 18.77C20.39 17.59 21.63 15.88 22.542 13 21.268 8.943 17.477 6 13 6c-1.61 0-3.13.397-4.468 1.1"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <p className="font-medium text-white">
                    {isPublic ? "Public" : "Private"}
                  </p>

                  <p className="text-sm text-neutral-500">
                    {isPublic
                      ? "Anyone can find and listen to this playlist."
                      : "Only you can access this playlist."}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic((current) => !current)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                  isPublic ? "bg-green-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Playlist..." : "Create Playlist"}
          </button>
        </form>
      </div>
    </main>
  );
}