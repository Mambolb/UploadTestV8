# Portfolio V9 — full website

## Scope and source

Derived from `CodeExport_ProtV9.rtf`. Compared with `CodeExport_ProtV8.rtf`: all project-page export definitions are identical. Therefore the eight dedicated pages, image/video files, and viewport-aware page layout are carried forward unchanged from V8; this release changes the homepage only.

The V9 file exports the default-like frame twice as `HomePage_HoverMail` (one without active mail state), `HomePage_HoverAbout`, `HomePage_HoverLightV4`, and `HomePage_HoverDarkV4`. There is no separate `HomePage_DefaultV3` in the V9 file; the inactive default is reconstructed from the first `HomePage_HoverMail` and the existing V8 implementation. The source is Figma CSS geometry, not actual exported HTML or embedded media.

## Changes in V9

- Fixed Figma 1440 × 1024 reference coordinates, scaled uniformly to the actual available browser width.
- White 32px header. Geist Mono 16/21 600. Five column widths 524/261/262/262/131, with Geist Mono 12/16 rows 28px high.
- Default: black background, white text; INDEX is red.
- All selected/merged values on project hover have WHITE backgrounds and RED text (`#FF0000`), without borders or strokes.
- Colourful hover preview REMAINS blurred, including when hovering the name. Removed the V8 image-unblur behavior.
- Source-specific hover positions: Shahed image `x:-28 y:0 w:1561 h:1041, blur:11.75px`; Digital Garden `x:-502 y:36 w:2315 h:1302, blur:11.25px`. Other projects retain their previous previews.
- ABOUT/MAIL/INSTAGRAM use consistent red-on-white visual hover. Only Instagram has a supplied real destination; it opens in a new tab. The About and Mail links remain visual until their real destinations are supplied.
- Kept real project labels and destinations from V8 instead of overwriting them with Figma's placeholder `PROJECT 02`, `PROJECT 06` entries.
- Project pages and assets untouched; no image or video quality reduction.

## Deploy with GitHub Desktop

1. Make a backup copy of the existing local repository folder.
2. Select the same repository in GitHub Desktop, click **Repository → Show in Finder**.
3. From `Portfolio_V9_Home_Update.zip`, copy **index.html**, **home.css**, and **home.js** into that repository folder, replacing the three existing files. Your `projects-data.js`, `assets/`, `projects/`, `scenes.js`, `detail.js`, and all other files remain unchanged.
4. GitHub Desktop → inspect Changes → commit to `main` → Push origin.
5. Open the GitHub Pages URL and use **Cmd+Shift+R** to bypass the browser cache.

For a new repository or a clean installation, use `Portfolio_V9_Full_Website.zip`: extract its contents into the root of the repository (the folder containing `index.html`). Keep the `.git` directory if replacing an existing repository in Finder.

Note: This is a DESKTOP Figma layout. Mobile-specific design remains to be supplied separately. The width-proportional home layout intentionally follows the Figma proportions at all desktop sizes, rather than rearranging the table.
