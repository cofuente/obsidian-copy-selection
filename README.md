# Copy on Selection

An Obsidian plugin that automatically copies highlighted text to the clipboard
whenever the selection changes — the same behavior Linux users know as
"primary selection" on X11, brought into Obsidian on every platform.

Works for both mouse drags and keyboard selection (`Shift`+arrows, `Shift`+Home,
double-click, triple-click). Debounced so that fast keyboard selection doesn't
spam the clipboard.

## Install

### From the Community Plugins browser

*(Once the plugin is accepted by the Obsidian team.)*

1. Open **Settings → Community plugins**
2. Turn off **Restricted mode** if it's on
3. Click **Browse**, search for *Copy on Selection*
4. Click **Install**, then **Enable**

### Manually

1. Download `main.js` and `manifest.json` from the
   [latest release](https://github.com/cofuente/obsidian-copy-selection/releases/latest)
2. Place both files in
   `<your-vault>/.obsidian/plugins/copy-on-selection/`
3. In Obsidian, go to **Settings → Community plugins**, click the reload icon,
   and toggle **Copy on Selection** on

## Settings

| Setting                  | Default | Description                                                                                                        |
| ------------------------ | :-----: | ------------------------------------------------------------------------------------------------------------------ |
| Debounce (ms)            |   150   | How long to wait after the selection stops changing before copying. Lower = more immediate, higher = fewer writes. |
| Minimum selection length |    1    | Selections shorter than this are ignored.                                                                          |
| Show notice on copy      |    ✓    | Briefly display a toast each time text is copied.                                                                  |
| Enable on touch (mobile) |    ✗    | Also fire after touch-based selection. iOS may silently block clipboard writes outside direct user gestures.       |

A **Reset** button at the bottom of the settings tab restores every value
to its default.

## Known limitations

- **iOS clipboard restrictions.** On iOS, `navigator.clipboard.writeText()`
  only works from direct user gestures. Selection-triggered copies may fail
  silently in some contexts. If mobile support matters to you, keep
  "Enable on touch" off until you've verified it works in your setup.
- **No clipboard-history integration.** The plugin overwrites the clipboard
  on each selection change. If you rely on a clipboard manager, entries
  will accumulate quickly during active reading.
- **No editor-/reading-view gating.** Selections in either view are copied.
  Open an issue if you'd like a setting to restrict this.

## Development

This project is set up for a Docker-based dev loop so nothing needs to be
installed on the host.

```bash
docker compose build
docker compose up        # or: docker compose watch
```

`esbuild` runs in watch mode inside the container and writes `main.js` to
the repo root. Symlink the repo into your vault's plugins directory so
Obsidian picks it up:

```bash
ln -s "$(pwd)" /path/to/vault/.obsidian/plugins/copy-on-selection
```

After each rebuild, toggle the plugin off and on in Obsidian's community
plugins list to pick up the new `main.js` (or install the **Hot-Reload**
community plugin to automate this).

## License

MIT — see [LICENSE](./LICENSE).
