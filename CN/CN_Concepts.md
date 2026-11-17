# Computer Networks Concepts and Theoretical Foundations
**Project Name:** Network Bandwidth Usage Anomaly Detection System  
**Document Purpose:** Academic Reference Document on Core Networking Fundamentals  

---

## 1. Introduction

The **Network Bandwidth Usage Anomaly Detection System** operates at the intersection of data communications, traffic analysis, and system security. To effectively design, interpret, and evaluate the behavior of such a system, a solid understanding of fundamental computer networking concepts is essential.

This document presents clear, professional, and accessible explanations of eight essential networking concepts and articulates how each directly relates to the project.

---

## 2. Local Area Network (LAN)

### Definition
A **Local Area Network (LAN)** is a computer network that interconnects computing devices within a limited geographical area, such as a laboratory, classroom, office building, or home. LANs are characterized by high data transmission rates, low latency, and private administrative ownership.

### How It Operates
In a LAN, devices (referred to as nodes or hosts) share common physical communication media—typically twisted-pair copper Ethernet cabling or Wi-Fi radio frequencies. Within this boundary, devices can exchange data directly at high speeds without requiring traversal across public telecommunications infrastructure or the Internet.

### Relevance to the Project
In this project, the three host workstations (`HOST-001`, `HOST-002`, `HOST-003`), the Cisco 2960 switch, and the Cisco 2911 router form a dedicated, self-contained local area network under the `192.168.1.0/24` subnet. This controlled LAN serves as the testing environment where traffic patterns can be monitored, baseline usage can be modeled, and bandwidth anomalies can be detected without external network noise.

---

## 3. IP Addressing

### Definition
An **Internet Protocol (IP) Address** is a unique numerical identifier assigned to every device participating in a network that uses the Internet Protocol for communication. In IPv4, an address is a 32-bit binary number traditionally written in dotted-decimal format (e.g., `192.168.1.10`), divided into four 8-bit octets.

### Key Components of IP Addressing
1. **Network ID vs. Host ID:**
   An IP address is divided into two logical sections:
   - **Network Portion:** Identifies the specific network or subnet.
   - **Host Portion:** Identifies the specific host device on that network.
2. **Subnet Mask:**
   A 32-bit sequence of contiguous binary ones followed by binary zeros (e.g., `255.255.255.0` or `/24`). Devices apply a bitwise logical `AND` between their IP address and the subnet mask to determine if a destination IP resides on the local subnet or an outside network.
3. **Private Addressing (RFC 1918):**
   Ranges such as `192.168.0.0/16` are reserved for internal, non-routable private networks, preventing conflicts with public internet space.
4. **Static vs. Dynamic Addressing:**
   - *Static:* Addresses are manually configured and remain permanent.
   - *Dynamic (DHCP):* Addresses are leased automatically and may change periodically.

### Relevance to the Project
Deterministic host attribution is vital for anomaly detection. This project utilizes static IPv4 addressing (`192.168.1.10`, `.11`, `.12`). If IP addresses changed arbitrarily, historical baselines would misattribute high-bandwidth behaviors. Static assignment ensures that every bandwidth reading is consistently mapped to a specific physical device.

---

## 4. Router

### Definition
A **Router** is a Layer 3 (Network Layer) networking device that connects two or more distinct computer networks and intelligently forwards data packets between them based on logical IP addresses.

### How It Operates
- **Routing Table Lookup:** When a router receives an IP packet, it decapsulates the Layer 2 frame, examines the destination IP address in the Layer 3 packet header, and searches its internal routing table to determine the best outgoing interface or next-hop router.
- **Default Gateway:** For hosts on a local subnet, the router serves as the **Default Gateway**. When a host needs to transmit data to an IP address outside its local subnet, it forwards the packet to the router's interface IP.
- **Broadcast Domain Separation:** Unlike switches, routers do not forward Layer 2 broadcast frames, effectively containing broadcasts within individual subnets.

### Relevance to the Project
The Cisco 2911 router configured at `192.168.1.1` acts as the default gateway for the testbed. When monitored hosts generate outbound traffic aimed at exterior networks or remote services, that traffic must transit through this router. It provides the boundary where outbound anomaly trends and gateway load can be evaluated.

---

## 5. Switch

### Definition
A **Switch** is a Layer 2 (Data Link Layer) networking device that connects multiple devices within the same local area network, receiving and forwarding data frames directly to the intended destination port.

### How It Operates
- **MAC Address Table (CAM Table):** As frames arrive at switch ports, the switch examines the source MAC address and records the ingress port in its Content Addressable Memory (CAM) table.
- **Selective Forwarding vs. Flooding:** When forwarding a frame:
  - If the destination MAC address is already present in the table, the switch forwards the frame *only* out of the designated port (unicast).
  - If the destination MAC address is unknown or is a broadcast address (`FF:FF:FF:FF:FF:FF`), the switch floods the frame to all other active ports.
- **Collision Domain Isolation:** Each port on a modern switch represents an independent collision domain operating in full-duplex mode, eliminating packet collisions.

### Relevance to the Project
The Cisco Catalyst 2960 switch serves as the central physical interconnect for all workstations and the router. Because it manages intra-subnet frame delivery, it enables full-speed concurrent communication among `HOST-001`, `HOST-002`, and `HOST-003`, while providing the potential monitoring point (such as port mirroring / SPAN) for packet inspection.

---

## 6. Ping

### Definition
**Ping** is a fundamental network diagnostic utility used to test the reachability of a host on an Internet Protocol (IP) network and measure round-trip transit time.

### How It Operates
- Ping utilizes the **Internet Control Message Protocol (ICMP)**.
- The initiating host sends an **ICMP Echo Request** (Type 8) packet to the target IP address.
- If the destination device is online, properly configured, and not blocking ICMP, it responds with an **ICMP Echo Reply** (Type 0) packet.
- **Key Metrics Reported:**
  - *Packets Sent and Received:* Identifies packet delivery success.
  - *Packet Loss Percentage:* Highlights transmission errors, link drops, or queue overflow.
  - *Round-Trip Time (RTT):* The time taken in milliseconds (ms) for a packet to travel to the destination and return.
  - *Time to Live (TTL):* An indicator of hop count and operating system stack.

### Relevance to the Project
All pairs of devices in the project underwent ping tests with **4 packets sent, 4 received, and 0% packet loss**. This verified that the physical cables, switch ports, and IP configurations were fully functional before any bandwidth anomaly tests were conducted, guaranteeing that subsequent system measurements reflect genuine application behavior rather than hardware dropouts.

---

## 7. Bandwidth

### Definition
**Bandwidth** refers to the theoretical maximum data transfer capacity of a network communication channel or link over a given period of time. It is typically expressed in bits per second (bps) and its metric multiples:
- **Kbps** (Kilobits per second) = $10^3$ bits/sec
- **Mbps** (Megabits per second) = $10^6$ bits/sec
- **Gbps** (Gigabits per second) = $10^9$ bits/sec

### Analogy and Nature
Think of bandwidth as the **width of a highway or the diameter of a water pipe**. A wider highway (higher bandwidth) allows a greater volume of traffic to pass through simultaneously under ideal conditions. Bandwidth is determined by the physical media, signaling technology, and hardware transceiver ratings (for example, a 100 Mbps FastEthernet link versus a 1000 Mbps GigabitEthernet link).

### Relevance to the Project
Bandwidth defines the upper ceiling for each connection in the topology. For instance, `HOST-001` is attached via a 100 Mbps link, while the router uplink supports up to 1000 Mbps. The Anomaly Detection System continuously tracks current utilization relative to available bandwidth capacity to identify spikes that threaten to saturate links.

---

## 8. Throughput

### Definition
**Throughput** is the actual, measured rate at which data is successfully delivered and processed across a transmission path from source to destination during a specific timeframe.

### Difference Between Bandwidth and Throughput
While bandwidth is the *potential capacity*, throughput is the *realized performance*. 

| Characteristic | Bandwidth | Throughput |
| :--- | :--- | :--- |
| **Concept** | Theoretical maximum capacity | Actual delivered payload rate |
| **Analogy** | Diameter of a pipe | Actual volume of water flowing through per second |
| **Limiting Factors** | Hardware specifications, physical media | Protocol overhead, latency, packet loss, congestion, CPU load |
| **Variability** | Fixed by link technology | Dynamic; fluctuates with application workload |

### Factors Constraining Throughput Below Bandwidth:
1. **Protocol Overhead:** Packet headers at the Data Link (Ethernet), Network (IP), and Transport (TCP/UDP) layers consume bytes that are not application payload.
2. **Network Contention:** Multiple hosts contending for shared switch buffers or router queues.
3. **Flow Control & Congestion Control:** TCP windowing algorithms throttle transfer rates when packet delays or acknowledgments slow down.

### Relevance to the Project
Throughput is the dynamic metric that fluctuates as workstations perform tasks. The anomaly detection engine measures throughput over sliding time windows. When an endpoint’s throughput suddenly spikes far above its typical baseline, the system flags it as an anomaly.

---

## 9. Network Traffic

### Definition
**Network Traffic** (also referred to as data traffic) is the overall quantity and movement of data packets traveling across a computer network at any given instant.

### Characteristics and Categorization
1. **By Direction and Location:**
   - *Ingress Traffic:* Packets entering a network node or interface.
   - *Egress Traffic:* Packets exiting a network node or interface.
2. **By Transmission Delivery Model:**
   - *Unicast:* One-to-one communication (e.g., standard web browsing or direct file transfer).
   - *Broadcast:* One-to-all communication within a local subnet (e.g., ARP requests).
   - *Multicast:* One-to-many communication to a subscribed group of nodes.
3. **By Behavior Profile:**
   - *Baseline (Normal) Traffic:* Predictable, daily usage patterns generated by authorized business or academic tasks (DNS lookups, web requests, periodic updates).
   - *Anomalous Traffic:* Unexpected surges, unauthorized bulk data exfiltration, port scanning, or denial-of-service packet floods that deviate sharply from the established baseline.

### Relevance to the Project
Network traffic provides the raw observable data for the **Network Bandwidth Usage Anomaly Detection System**. By collecting time-series traffic metrics (packet counts, byte volumes, and transfer durations), the system differentiates between routine network activity and aberrant traffic events, enabling early detection of bottlenecks, misconfigured hosts, or security incidents.

---

## 10. Summary Comparison Matrix

The table below summarizes the operational differences between the core hardware and metric pairs discussed:

| Category | Component A | Component B | Key Distinction |
| :--- | :--- | :--- | :--- |
| **Hardware** | **Switch (Layer 2)** | **Router (Layer 3)** | A switch connects devices within the same subnet using MAC addresses; a router interconnects different subnets using IP addresses and directs inter-network traffic. |
| **Performance Metric** | **Bandwidth** | **Throughput** | Bandwidth represents maximum theoretical channel capacity; throughput represents actual successfully transferred payload per unit time. |
| **Monitoring Metric** | **Ping (ICMP Echo)** | **Network Traffic Volume** | Ping tests point-to-point reachability and round-trip delay; network traffic measures aggregate packet and byte throughput flowing through the system. |
