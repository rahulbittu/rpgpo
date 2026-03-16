# Subtask Output — Synthesize Security Hardening Guide
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Key Findings

1. **Router Security Settings**: Use WPA3 Personal for encryption, change default admin credentials, enable WiFi firewall, disable WPS, turn off remote access, and update firmware regularly.
2. **VLAN Setup and IoT Device Isolation**: No specific guides found; use separate SSIDs for basic isolation.
3. **DNS Filtering**: No specific tools or guides found; routers typically allow DNS settings configuration.

## Detailed Analysis

### Router Security Settings
- **WPA3 Personal**: This is the latest and most secure Wi-Fi encryption protocol. It provides enhanced security features such as individualized data encryption.
- **Admin Credentials**: Changing default credentials is crucial to prevent unauthorized access. Use strong, unique passwords.
- **WiFi Firewall**: Enabling this feature helps block unauthorized access attempts.
- **WPS and Remote Access**: Disabling these features reduces potential vulnerabilities.
- **Firmware Updates**: Keeping firmware up-to-date ensures the latest security patches are applied.

### VLAN Setup and IoT Device Isolation
- **Separate SSIDs**: While not a true VLAN setup, using different SSIDs for different frequency bands (2.4GHz and 5GHz) can help in basic device isolation.
- **VLANs**: No specific guides or examples were found, indicating a potential gap in available consumer resources for VLAN setup on home routers.

### DNS Filtering
- **DNS Settings**: Most routers allow manual configuration of DNS settings, which can be used to implement DNS filtering for added security. However, specific tools or guides for setting up DNS filtering were not found.

## Recommended Actions

1. **Enhance Router Security**
   - **What to Do**: Switch to WPA3 Personal, change admin credentials, enable WiFi firewall, disable WPS, turn off remote access, and update firmware.
   - **Why**: These steps significantly reduce the risk of unauthorized access and data breaches.
   - **Expected Outcome**: Improved overall network security.
   - **First Step**: Access your router's admin page and change the security protocol to WPA3 Personal.

2. **Implement Basic IoT Device Isolation**
   - **What to Do**: Use separate SSIDs for different frequency bands.
   - **Why**: This provides a basic level of isolation for IoT devices, reducing potential attack vectors.
   - **Expected Outcome**: Enhanced security for IoT devices, minimizing their impact on the main network.
   - **First Step**: Log into your router settings and configure separate SSIDs for 2.4GHz and 5GHz bands.

3. **Configure DNS Filtering**
   - **What to Do**: Manually set DNS servers in your router settings to use services like OpenDNS or Google DNS.
   - **Why**: DNS filtering can block malicious sites and provide an additional layer of security.
   - **Expected Outcome**: Reduced risk of accessing harmful websites.
   - **First Step**: Access the DNS settings in your router's admin page and enter the DNS addresses for a trusted service.

These actions, based on the available data, will help improve the security of your home network. For more advanced configurations like VLAN setup, further research or professional consultation may be necessary.
