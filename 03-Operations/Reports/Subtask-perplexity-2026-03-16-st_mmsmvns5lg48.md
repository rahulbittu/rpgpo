# Subtask Output — Research WebRTC Components
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Signaling in WebRTC
Signaling establishes initial peer connections by exchanging session descriptions (SDP) and ICE candidates via out-of-band channels like WebSockets or HTTP, as it's not part of core WebRTC protocols. In Jitsi Meet configuration, signaling integrates with P2P mode enabled via `p2p: { enabled: true }` and ICE policy set to `'all'`, with a 5-second back-to-P2P delay[4]. The process completes ICE negotiation in under 2 seconds on stable connections, with failures often at ICE gathering stage requiring STUN/TURN[2].

## STUN/TURN Servers
**STUN** discovers public IP/port behind NAT by reflecting client requests; default port 3478 UDP/TCP. **TURN** relays media for symmetric NAT cases, using ports like 443 TCP/UDP for compliance or 5349 for secure TURN. Common setup: Coturn server on Ubuntu 20.04 LTS t3.micro AWS EC2 instance; install via `sudo apt-get install coturn`, enable with `TURNSERVER_ENABLED=1` in `/etc/default/coturn`, set `listening-port=443` and `listening-ip=<private IP>` in `/etc/turnserver.conf`[1]. URIs: `stun:xxx.xxx.xxx.xxx:443` or `turn:xxx.xxx.xxx.xxx:443`[1]. Jitsi uses `stun:meet-jit-si-turnrelay.jitsi.net:443` and custom `stun:jitsi-meet.example.com:3478`[4]. Public options: Google's STUN for dev (not production); managed like Twilio Network Traversal or Xirsys[2]. Security: Deploy in isolated DMZ, block RFC1918 ranges/IP blocklists, rate limit to ~50 allocations/user, disable RFC5780/RFC3489/DTLS if unused[3].

| Server Type | Role | Default Ports | Examples |
|-------------|------|---------------|----------|
| STUN | Public IP/port discovery | 3478 UDP/TCP | meet-jit-si-turnrelay.jitsi.net:443[4]; Google public[2] |
| TURN | Media relay for failed P2P | 3478/443/5349 UDP/TCP | Self-hosted Coturn on AWS t3.micro[1]; Twilio/Xirsys[2] |
| ICE | Candidate orchestration | N/A | Prioritizes pairs, falls back to TURN[2] |

## Media Streams
Media streams (audio/video) flow peer-to-peer post-ICE via UDP after NAT traversal; TURN relays if direct fails, adding latency but ensuring connectivity[2][5]. In Webex Contact Center, browser endpoints use ICE/STUN/TURN for direct audio to cloud media services[5]. Security Center SaaS requires browser/appliance on same network or TURN allowlisted across networks; falls back to HTTPS if WebRTC fails[7]. Autoscaling challenges: Media servers (SFU/MCU) form sticky sessions, can't migrate live streams without disruption[8]. Jitsi filters TURN/UDP by default for videobridge unless `useTurnUdp: true`[4].

## Data Channels (RTCDataChannel)
RTCDataChannel enables low-latency peer-to-peer data (e.g., chat, files) over SCTP/DTLS atop ICE-negotiated paths, covered in development guides alongside signaling/STUN/TURN[2]. No specific port; uses same UDP media paths post-ICE, with TURN relay if needed[2][9]. Common in video chat/collaboration; scales via SFU but stateful like media[2][8].

**Next Steps**:
- Deploy Coturn: Launch AWS t3.micro Ubuntu 20.04, follow [1] steps (5-10 min setup).
- Test: Use `turn:your-ip:443?transport=tcp` with username/password in WebRTC client.
- Secure: Apply [3] checklist – isolate network, add `deny-rf1918` in turnserver.conf.
- Scale: Monitor ~50 allocations/user; integrate Twilio for low-volume[2].
