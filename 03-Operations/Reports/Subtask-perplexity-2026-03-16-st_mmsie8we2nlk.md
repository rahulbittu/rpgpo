# Subtask Output — Research Home Network Security Practices
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Router Security Settings
Apple recommends switching to **WPA3 Personal** as the primary security protocol in your router's wireless settings for encryption, falling back to **WPA2/WPA3 Transitional** for older devices or **WPA2 Personal (AES)** if needed; avoid WPA/WPA2 mixed modes, WEP, TKIP, or no security.[1] Change default router admin credentials (e.g., "admin/admin") to unique strong passwords via the router's admin page to block known exploits.[2][3] Enable the built-in WiFi firewall, disable WPS (Wi-Fi Protected Setup), turn off remote access, and update firmware regularly through the manufacturer's app or settings page.[2]

## VLAN Setup and IoT Device Isolation
No specific guides or examples found in recent search results for VLAN configuration steps, tools, or home router models supporting VLANs for IoT isolation (searched queries: "home router VLAN setup IoT isolation 2026", "best VLAN practices home network security", "IoT device isolation VLAN guide recent").[no relevant results] General inference from router security sources: Use separate SSIDs for 2.4GHz/5GHz bands (e.g., split them in settings) as a basic isolation step, though not true VLANs.[5]

## DNS Filtering
No current, specific instructions, tools (e.g., NextDNS, Pi-hole setups), or router models with DNS filtering steps in results (searched: "home network DNS filtering best practices 2026", "router DNS filtering security guide").[no relevant results] Router admin pages often include DNS settings under advanced WAN options, but no dated examples provided.

## Additional Best Practices
- Broadcast your SSID openly with a strong password instead of hiding it to avoid battery drain on devices.[1]
- For 2026 AI threats, prioritize WPA3-Personal in wireless security settings as above.[4]

**Next Steps**: Access your router admin (e.g., 192.168.1.1 or app), apply WPA3 changes first (5-10 min), check firmware (e.g., TP-Link example in [1]), then test security at ubifi.net tool.[2] For VLAN/DNS gaps, search manufacturer docs (e.g., "TP-Link Archer VLAN setup") or upgrade to VLAN-capable routers like Ubiquiti Dream Machine (not in results).

Sources:  
- [1] https://www.bgr.com/2117787/settings-apple-recommends-changing-on-wifi-router/  
- [2] https://ubifi.net/blog/how-to-check-if-wifi-is-secure/  
- [3] https://www.howtogeek.com/please-stop-using-your-smart-homes-default-security-settings/  
- [4] https://botexy.com/how-to-secure-your-home-router-in-2026-from-ai-hackers/  
- [5] https://www.xda-developers.com/lesser-known-router-settings-to-fix-your-wi-fi-problems-overnight/
