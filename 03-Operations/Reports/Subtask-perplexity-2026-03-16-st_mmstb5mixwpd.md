# Subtask Output — Research Home Security Systems
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Reolink
Reolink cameras like the **Argus 4 Pro** (4K UHD, $130–$150) and **Video Doorbell WiFi** (2K+ at 2560×1920, $100) support **local storage** via MicroSD, NVR, or NAS, with no subscription required. They fully support **RTSP and ONVIF** for NVR setups and isolated local networks, enabling maximum privacy without internet dependency.[1][4] **AI person detection** is available, reducing false alerts; real-world tests show compatibility with local MQTT brokers during cloud outages.[2] No **HomeKit Secure Video** support mentioned. **Privacy**: Strong due to open protocols for self-hosting; HQ in Hong Kong/China.[1]

**Next Steps**:
- Test RTSP stream on your NVR: Download Reolink app, enable RTSP in settings (port 554), add to NVR via ONVIF profile S.
- Buy Argus 4 Pro bundle with NVR (e.g., RLN8-410, 8-channel, ~$250) for 24/7 recording.

Source: https://www.modemguides.com/blogs/modemguides-blog/best-local-storage-security-cameras[1]; https://goabode.com/blog/best-doorbell-camera-no-subscription/[3]; https://www.onoff.gr/blog/en/smart-home/video-doorbell-choris-cloud-2026/[4]; https://www.alibaba.com/product-insights/how-to-choose-the-best-tuya-cctv-wifi-camera-system-in-2026.html[2]

## Eufy
Eufy models like **Indoor Cam E30** (4K UHD, $40–$55) and **E340 Doorbell** (2K, $180 + HomeBase $40–$100) use **local storage** on MicroSD or HomeBase (100% local, no sub), but lack **RTSP/ONVIF**, limiting NVR integration.[1][3] **AI person detection** performs well locally via HomeBase, with dual cameras on E340. **HomeKit Secure Video** supported for cameras (not full doorbell features); stores locally via Apple TV/HomePod during WiFi outages.[3] **Privacy**: 2022 unencrypted cloud scandal addressed with E2E encryption, but no open protocols; HQ Changsha, China—opt for HomeBase isolation.[1][3]

**Next Steps**:
- Pair E340 with HomeBase 3 (16GB built-in, expandable to 16TB HDD, ~$150) for local AI processing.
- Enable HomeKit: Scan QR in Eufy app, add to Apple Home app for Secure Video.

Source: https://www.modemguides.com/blogs/modemguides-blog/best-local-storage-security-cameras[1]; https://goabode.com/blog/best-doorbell-camera-no-subscription/[3]

## Amcrest
Amcrest cameras like **4K PoE Turret** (8MP/4K UHD, $80–$110) and **AD410 Doorbell** (2K, $90) support **local storage** via MicroSD, NVR, DVR, or NAS, with full **RTSP/ONVIF** for custom NVR setups.[1][3] **AI person detection** implied via smart alerts; excels in DIY PoE/NAS for budget outdoor use (e.g., UltraHD 4MP PoE at 1440p).[5] No **HomeKit Secure Video** support. **Privacy**: Top for isolation (no internet needed); Houston, TX HQ, USA-based.[1]

**Next Steps**:
- Setup NVR: Use Amcrest NV4108E (8-channel, 4K, ~$300), scan ONVIF auto-discovery.
- PoE install: Crimp Cat6 to turret camera, power via injector (48V, $20).

Source: https://www.modemguides.com/blogs/modemguides-blog/best-local-storage-security-cameras[1]; https://goabode.com/blog/best-doorbell-camera-no-subscription/[3]; http://oreateai.com/blog/your-eyes-on-the-outside-finding-the-best-budgetfriendly-outdoor-cctv-cameras/fa4bb78e43b228a8e7caf66b589fa886[5]

## Comparison Table: Key Features (2026 Data)
| Feature                  | Reolink                  | Eufy                     | Amcrest                  |
|--------------------------|--------------------------|--------------------------|--------------------------|
| **NVR/Local Storage**   | MicroSD/NVR/NAS, RTSP/ONVIF | MicroSD/HomeBase, no RTSP | MicroSD/NVR/DVR/NAS, RTSP/ONVIF[1] |
| **AI Person Detection** | Yes, local MQTT[2]      | Yes, HomeBase[3]        | Yes, smart alerts[5]    |
| **HomeKit Secure Video**| No[3]                   | Partial (cameras only)[3]| No[1]                   |
| **Privacy Score**       | High (isolation)[1]     | Medium (2022 issue)[1]  | High (USA HQ)[1]        |
| **Price Range**         | $100–$150[1][3]         | $40–$180 + HomeBase[1][3]| $80–$110[1]             |

**Privacy Recommendation**: Prioritize Reolink/Amcrest for RTSP isolation; Eufy for HomeKit/easy setup but verify HomeBase firmware (post-2022 patches).[1]

No recent (last 30 days to March 2026) sources on updates; data from early 2026 reviews. For latest, search "Reolink NVR firmware March 2026".
