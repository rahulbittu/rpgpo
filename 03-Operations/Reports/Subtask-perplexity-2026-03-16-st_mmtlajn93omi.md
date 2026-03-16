# Subtask Output — Research Best Practices for Home Network Security
## Model: sonar
## Stage: audit
## Date: 2026-03-16

I need to conduct additional web searches to provide you with current, specific information on enterprise-grade home network security setup. The provided results focus primarily on VLANs but lack details on IDS/IPS, DNS filtering, VPN servers, and monitoring stacks. Let me search for comprehensive, actionable guidance.

Based on the search results provided, I can address **VLAN segmentation** specifically, but I must conduct additional research to deliver the complete enterprise-grade home network security setup you've requested, including IDS/IPS (Suricata), DNS filtering, VPN servers, and monitoring (Grafana/Prometheus) with real data and URLs.

## What I Can Confirm From Current Results

**VLAN Segmentation Best Practices:**

**Plan segmentation by function:** Identify departments, systems, or user groups to separate—this reduces broadcast traffic and isolates sensitive resources[1]. For home labs, this means separating management traffic, IoT devices, and storage into distinct VLANs[3].

**Assign clear VLAN IDs and naming conventions:** Consistent labeling prevents configuration errors when setting up switches and access control lists (ACLs)[1]. Example configuration from a Talos Linux home lab shows VLAN 10 for management (192.168.10.0/24), VLAN 20 for IoT (192.168.20.0/24), and VLAN 30 for storage (192.168.30.0/24)[3].

**Use managed switches for VLAN enforcement:** Unmanaged Layer 2 switches cannot implement VLANs; you need managed switches that support VLAN tagging and trunk ports[4]. Trunk ports carry traffic from multiple VLANs between switches, while access ports assign devices to single VLANs[2].

**Enforce inter-VLAN policies with firewalls:** VLANs alone are insufficient—you must apply firewall rules at segment boundaries to restrict communication between VLANs[1]. Without proper routing controls, inter-VLAN traffic can leak, defeating segmentation[1].

**Restrict remote access via VPNs:** Use split tunneling or restricted VPN paths to prevent compromised endpoints from accessing all network segments[1].

---

## Critical Gap: Missing Information

The provided search results do **not** contain current, specific information on:
- **Suricata IDS/IPS** configuration, performance metrics, or deployment guides
- **DNS filtering** solutions (Pi-hole, Adguard, etc.) with setup details
- **VPN server** options (WireGuard, OpenVPN) with configuration specifics
- **Grafana and Prometheus** monitoring stack setup for home networks
- Real product names, pricing, installation URLs, or 2026 release dates

**To deliver the actionable, data-driven response you need**, I would require live web searches for:
1. Current Suricata deployment guides (2025-2026)
2. DNS filtering best practices with specific tools and URLs
3. VPN server setup tutorials with performance benchmarks
4. Grafana/Prometheus home lab monitoring configurations

Would you like me to conduct these additional searches now to provide the complete enterprise-grade home network security blueprint with real URLs, configuration examples, and specific product recommendations?
