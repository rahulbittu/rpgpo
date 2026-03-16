# Subtask Output — Research Media Server Options
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Jellyfin Overview
Jellyfin is a fully open-source (GPLv2) media server emphasizing privacy, no telemetry, and community-driven features, ideal for homelab users and Linux/NAS admins.[5] It runs 100% locally with zero cloud dependency and supports hardware-accelerated transcoding like VA-API, reducing CPU load by 68% in multi-client 4K HDR scenarios compared to Plex.[5] Best for privacy-first setups; wins for cost (completely free) and control in 2026 comparisons.[1][2][3][4]

- **Hardware Requirements**: Excellent ARM64 support; runs on nearly anything, including Synology/QNAP NAS (x86 models via Docker—avoid ARM for video). Workstation with NVIDIA RTX 4060+ enables multi-stream 4K HDR via NVENC Gen 5; per-client transcode profiles handle H.264 for old devices and native HEVC for modern TVs like LG C3 OLED.[5]
- **Storage Solutions**: Docker-based on NAS; no specific limits noted, but optimized for homelabs with manual plugin setup for media organization.[2][5]
- **Remote Access Setup**: Runs locally with more hands-on configuration; no native cloud sync, but plugins enable remote streaming. Lacks offline sync stability on iOS mobile apps.[5]

Source: https://www.alibaba.com/product-insights/how-to-choose-the-best-media-server-for-your-needs-in-2026.html[5]

## Plex Overview
Plex is proprietary with a polished, beginner-friendly interface, wide device support (phones, smart TVs, consoles), and extras like podcasts, live TV, trailers, and free streaming channels.[1][3][4] Plex Pass costs $40/year for hardware transcoding, offline downloads, and mobile sync; two confirmed data breaches noted as privacy risk.[4] Wins for ease of use and hybrid personal/streaming in 2026.[1][2]

- **Hardware Requirements**: CPU saturation common in multi-client playback without Pass-enabled hardware transcoding; NVIDIA RTX 4060+ leverages NVENC Gen 5 for 4K HDR. Disable "optimize for slow devices" to avoid quality loss.[5]
- **Storage Solutions**: Cloud sync integration; supports personal libraries with automatic metadata.[1]
- **Remote Access Setup**: Easiest with built-in remote streaming and cloud features; shares some data by default (opt-out possible).[2][4]

Source: https://www.youtube.com/watch?v=vNwCUWefRxI[4]

## Emby Overview
Emby is freemium (server free; Premiere $5/month for premium features like cloud sync, parental controls, live TV), offering balance between Plex polish and Jellyfin control with strong music management and Windows/macOS apps.[5][7] Highly customizable with better parental controls than Plex per users; lags on new codecs like AV1 web decode.[5] Underrated middle-ground option in 2026.[4]

- **Hardware Requirements**: Similar to Plex; NVENC support lags one generation behind Jellyfin/Plex. Strong on x86 NAS via Docker.[5]
- **Storage Solutions**: Optional cloud sync; minimalist self-hosting for core features.[7][8]
- **Remote Access Setup**: Flexible remote streaming with optional cloud; smaller plugin ecosystem than Jellyfin.[2][5]

Source: https://www.alibaba.com/product-insights/how-to-choose-the-best-media-server-for-your-needs-in-2026.html[5]

## Comparison Table

| Aspect              | Jellyfin                          | Plex                              | Emby                              |
|---------------------|-----------------------------------|-----------------------------------|-----------------------------------|
| **Licensing/Cost** | Free, open-source (GPLv2)[5]     | $40/year Plex Pass[4]            | $5/month Premiere[5]             |
| **Privacy**        | Best (no telemetry)[2][5]        | Data sharing (2 breaches)[4]     | Balanced, optional cloud[5]      |
| **Hardware Transcoding** | VA-API/NVENC Gen5, 68% CPU drop[5]| NVENC Gen5 (paid)[5]             | NVENC (lags gen)[5]              |
| **Remote Access**  | Manual/plugins[2]                | Easiest/cloud[2][4]              | Flexible/optional cloud[5]       |
| **Best For**       | Privacy/homelab[1][5]            | Ease/polish[1][3]                | Balance/parental[2][4][7]        |

## Next Steps
- Test Jellyfin on existing NAS: Install via Docker (e.g., Synology DSM), add VA-API for transcoding—benchmark CPU on 4K multi-stream.[5]
- Trial Plex Pass: 30-day free at plex.tv/pricing; check remote access speed on your network.[4]
- Compare Emby Premiere: 14-day trial at emby.media/premiere; evaluate music/parental features.[5]
- Hardware upgrade: NVIDIA RTX 4060 (~$300 as of Mar 2026) for all three.[5]
