# Subtask Output — Research Smart Home Platforms
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Home Assistant and Matter Compatibility
Home Assistant 2026.3 release (March 4, 2026) added Matter support for **carbon monoxide alarm states** and **TVOC air quality sensors**, enabling direct integration of Matter-certified CO sensors and air quality devices.[2]  
HomeKit Controller in the same release exposes **water level sensors** for devices like Smartmi Humidifier Rainforest.[2]  
**Matter settings pages** reorganized for better Zigbee, Z-Wave, Bluetooth integration; supports Ecovacs and Roborock vacuums using Home Assistant areas.[2]  
**t0bst4r/home-assistant-matter-hub** (GitHub project) simulates bridges to publish Home Assistant entities to Matter controllers like Apple Home, Alexa, Google Home.[7]  
Source: https://www.home-assistant.io/blog/2026/03/04/release-20263/[2]; https://github.com/t0bst4r/home-assistant-matter-hub[7]

## Apple HomeKit and Matter Compatibility
**Shelly Plug US Gen4** (reviewed March 13, 2026) supports **Matter** for direct addition to Apple Home via QR scan (requires Apple TV/HomePod hub); also Wi-Fi 6, Zigbee (flashable), power metering for automations like 30-minute high-draw cutoff.[1]  
**Apple Matter controllers**: Apple TV 4K (3rd Gen, 64GB/128GB Wi-Fi + Ethernet), HomePod mini, HomePod 2nd Gen; integrate with Home app/Siri/iPhone/iPad.[5]  
**Yale smart locks** (newer models) support Apple HomeKey and Matter; Aqara U200/U300, Schlage Encode Plus, Level Lock Plus as alternatives.[3]  
**Arre and Aqara smart buttons** work via Matter (Aqara needs hub); support single/double/long press actions.[3]  
In February 2026, most new bulbs, plugs, locks, thermostats support Matter natively in HomeKit.[6]  
Source: https://9to5mac.com/2026/03/13/homekit-weekly-shelly-gen4-plug-brings-wi-fi-6-matter-and-thread-to-a-single-outlet/[1]; https://www.gearbrain.com/what-matter-controller-smart-home-guide-2675286669.html[5]

## Matter Protocol Overview and Cross-Compatibility
Matter enables universal compatibility across Apple Home, Google Home, Alexa without proprietary bridges; look for Matter logo on 2026 devices.[3][5]  
**Controllers/hubs**: Homey Pro (2026, supports Z-Wave, Zigbee, Wi-Fi, BLE, IR, Matter/Thread), Aqara Hub M3, Hue Bridge (2nd Gen), Aeotec Smart Home Hub, Brilliant Controls.[5]  
Eliminates pre-2023 ecosystem lock-in; e.g., Yale locks work on all platforms.[3]  
Source: https://powermoves.blog/smart-home/automation-ideas/[3]; https://www.gearbrain.com/what-matter-controller-smart-home-guide-2675286669.html[5]; https://www.onoff.gr/blog/en/smart-home/homekit-vs-google-home-vs-alexa/[6]

## Automation Capabilities
- **Shelly Gen4 Plug**: Power metering for safety automations (e.g., shutoff after 30min high draw like iron); Home Assistant flashable for Zigbee.[1]  
- **Home Assistant 2026.3**: Voice to-do list removal, NRGkick EV charger pause switch, JVC projector controls (HDR, low latency), VeSync humidifier auto-dry, Switcher heaters.[2]  
- **Matter-wide**: Multi-press buttons (Arre/Aqara) trigger actions across platforms; package notifications via motion.[3]  
Source: https://9to5mac.com/2026/03/13/homekit-weekly-shelly-gen4-plug-brings-wi-fi-6-matter-and-thread-to-a-single-outlet/[1]; https://www.home-assistant.io/blog/2026/03/04/release-20263/[2]; https://powermoves.blog/smart-home/automation-ideas/[3]

**Next Steps**: Test Shelly Gen4 Plug ($TBD, US outlet) with Home Assistant Matter integration—scan QR to Apple Home/Google/Alexa; update to HA 2026.3 for CO/air sensors. Verify hub (e.g., HomePod mini) via Apple Home app Matter onboarding.[1][2][5]
