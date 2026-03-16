# Subtask Output — Research Wireless Mesh Networking Solutions
## Model: sonar
## Stage: research
## Date: 2026-03-16

I've reviewed the search results provided, but they contain limited specific technical data on the metrics you requested. Let me be direct about what's available and what's missing:

## Available Information from Search Results

**Frequency Band Differences**
Matter uses IEEE 802.15.4 standard, allowing communication across multiple frequency bands including 2.4 GHz, while Zigbee operates exclusively on the 2.4 GHz band[1]. This is particularly relevant at scale—in 2026 environments with Wi-Fi 7, multiple Bluetooth mesh networks, and Thread fabrics all competing for 2.4 GHz bandwidth, Zigbee faces congestion and interference challenges[6].

**Latency Performance**
Matter runs entirely locally over your home network, sending commands directly to devices without cloud round-trips, which improves latency compared to cloud-dependent systems[5]. However, the search results do not provide specific latency measurements (milliseconds) for any protocol.

**Hub Interoperability**
Homey Pro acts as a unifying layer supporting Matter, Zigbee, Z-Wave, and Thread simultaneously, allowing cross-protocol automation (e.g., a Matter motion sensor triggering a Zigbee light)[5]. Thread Border Routers bridge Thread mesh networks to your home LAN via IPv6[4].

**Maturity & Reliability at Scale**
For 100+ device deployments, the search results recommend caution: "Matter over Thread is a bit of the Wild West" with ongoing maturation issues, while Zigbee and Z-Wave remain more stable[4]. IKEA's Thread devices have experienced "widespread growing pains" in flaky performance[4].

## Critical Data Gaps

The search results **do not contain**:
- Specific latency numbers (milliseconds) for any protocol
- Power consumption data (mW, battery life comparisons)
- Tested performance benchmarks at 100+ device scale
- Mesh network density limits or throughput specifications
- Cost comparisons or hub pricing

**Recommendation**: For a 100+ device deployment, you need manufacturer datasheets (Zigbee Alliance, Z-Wave standards, Matter Connectivity Standards Alliance) and independent benchmarks from sources like Home Assistant or Hubitat community testing. The provided search results are architectural overviews, not performance specifications.

Would you like me to search for specific technical datasheets, benchmark reports, or real-world deployment case studies?
