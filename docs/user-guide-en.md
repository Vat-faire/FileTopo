# User guide — FileTopo

FileTopo turns folder metadata into a local topographic map. It works offline, without AI or telemetry, and never reads file contents while indexing.

## Add and index a collection

1. Click **Add a collection**.
2. Choose the root folder yourself in the Windows dialog. Cancelling creates nothing.
3. The root is only registered; no scan starts automatically.
4. Click **Index now** to start scanning. The button shows progress and can cancel the operation.

The SQLite index is written to private application data, never to the selected folder. Symbolic links, junctions, and other reparse points are recorded as skipped and are never followed. Cancelling never replaces a valid index with a partial index.

## Explore

- Click a relief marker or a row to synchronize the map and selection card.
- Turquoise dots identify items that have not been viewed yet.
- Use search, the **Folders/Files**, **Online**, or **Unseen** filters. Large result sets are paged in groups of 120.
- Use **−** and **+** to change how many landmarks the map displays.
- For a local collection, **Show in File Explorer** is the only action that opens Windows. It requires an explicit click and can only target a previously indexed path below the registered root.

## Privacy and limits

- Required names, relative paths, sizes, dates, and attributes remain on the computer.
- An online-only file is detected from its attributes; FileTopo does not request its download.
- Rebuild the index when files change. An item that was deleted or replaced by a reparse point will refuse to open.
- The current version is a local Windows MVP. It is not published and has no automatic updater.

Use **Demo** or **Synthetic fixture** to explore FileTopo without selecting a personal folder.
