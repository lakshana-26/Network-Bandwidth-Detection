# IP Addressing Table
**Project Name:** Network Bandwidth Usage Anomaly Detection System  
**Document Purpose:** Network Addressing Architecture and Subnet Allocation Specification  

---

## 1. Subnet Specification Summary

The network infrastructure operates within a private IPv4 address block defined by **RFC 1918**. A single Class C subnet with a standard `/24` prefix mask is allocated for the local area network.

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Network Address** | `192.168.1.0` | Base identifier of the local subnet |
| **CIDR Prefix** | `/24` | 24 bits allocated to the network portion |
| **Subnet Mask (Dotted-Decimal)** | `255.255.255.0` | Mask applied to separate network and host bits |
| **Subnet Mask (Hexadecimal)** | `0xFFFFFF00` | Hexadecimal equivalent of the mask |
| **Usable Host IP Range** | `192.168.1.1` - `192.168.1.254` | Range of assignable node addresses (254 hosts) |
| **Directed Broadcast Address** | `192.168.1.255` | Reserved for subnet-wide broadcasts |
| **Default Gateway** | `192.168.1.1` | Router ingress interface for outbound traffic |
| **Address Allocation Method** | Static IPv4 | Manually assigned to maintain deterministic host tracking |

---

## 2. Master Device IP Addressing Table

The following table provides the comprehensive configuration parameters for all physical and network devices within the topology:

| Device Name | Device Type | Interface | IP Address | Subnet Mask | CIDR Prefix | Default Gateway | Assignment | Operational Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cisco 2911** | Router | `GigabitEthernet 0/0` | `192.168.1.1` | `255.255.255.0` | `/24` | *N/A (Local Ingress)* | Static | Default Gateway / Border Router |
| **Cisco 2960** | Layer 2 Switch | `VLAN 1` (Management) | *Unassigned / Layer 2* | `255.255.255.0` | `/24` | `192.168.1.1` | Unmanaged / L2 | Central Layer 2 Interconnect |
| **HOST-001** | Workstation PC | `FastEthernet 0` | `192.168.1.10` | `255.255.255.0` | `/24` | `192.168.1.1` | Static | Monitored Node / Traffic Generator |
| **HOST-002** | Workstation PC | `FastEthernet 0` | `192.168.1.11` | `255.255.255.0` | `/24` | `192.168.1.1` | Static | Monitored Node / Traffic Generator |
| **HOST-003** | Workstation PC | `FastEthernet 0` | `192.168.1.12` | `255.255.255.0` | `/24` | `192.168.1.1` | Static | Monitored Node / Traffic Generator |

---

## 3. Subnet Calculations and Binary Breakdown

For academic verification, the bit-level separation of the network identifier and the host identifier is detailed below:

### Bit Division
- **Network Bits:** 24 bits (`11111111.11111111.11111111.00000000`)
- **Host Bits:** 8 bits ($2^8 = 256$ total addresses, $2^8 - 2 = 254$ usable host addresses)

### Bitwise AND Operation (Network Identification)

To determine whether destination hosts reside on the local subnet, each node performs a bitwise logical `AND` operation between its IP address and the subnet mask:

```
HOST-001 IP:    192.168.1.10      ->  11000000.10101000.00000001.00001010
Subnet Mask:    255.255.255.0     ->  11111111.11111111.11111111.00000000
---------------------------------------------------------------------------------
Network ID:     192.168.1.0       ->  11000000.10101000.00000001.00000000
```

### Address Classification Table

| Address Class | Range | Subnet Mask | Private IP RFC | Status in Project |
| :--- | :--- | :--- | :--- | :--- |
| **Class C** | `192.0.0.0` to `223.255.255.255` | `255.255.255.0` | RFC 1918 (`192.168.0.0/16`) | Configured (`192.168.1.0/24`) |

---

## 4. Design Rationale and Anomaly Detection Alignment

1. **Static IP Assignment over Dynamic DHCP:**
   - In an anomaly detection environment, deterministic addressing is critical. If DHCP was employed without fixed reservations, host IP addresses could change upon lease renewal, disrupting longitudinal traffic analysis and per-host bandwidth baselines.
   - Static IP binding ensures that telemetry collected by the detection engine accurately correlates with the specific physical machine (`HOST-001`, `HOST-002`, or `HOST-003`).

2. **Reserved Gateway Positioning (`192.168.1.1`):**
   - Reserving the first usable address (`.1`) for the Cisco 2911 router adheres to industry standards.
   - All client machines direct outbound or routed anomaly traffic to this unified ingress point.

3. **Subnet Scope and Headroom:**
   - The `/24` prefix provides up to 254 distinct host addresses, allowing future scalability to incorporate additional test hosts, external packet sniffers, or dedicated monitoring servers without re-architecting the IP plan.
