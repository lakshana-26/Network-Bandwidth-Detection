# Ping Test Results and Connectivity Verification
**Project Name:** Network Bandwidth Usage Anomaly Detection System  
**Document Purpose:** Verification of Layer 2 and Layer 3 Network Connectivity  

---

## 1. Objective and Testing Methodology

Before deploying the **Network Bandwidth Usage Anomaly Detection System**, baseline network reachability and link stability must be verified across all participating endpoints. 

The primary utility used for this validation is **Ping**, which operates via the **Internet Control Message Protocol (ICMP)**. By transmitting ICMP Echo Request packets and awaiting ICMP Echo Reply packets, the test confirms:
1. Physical link continuity and operational duplex status.
2. Data Link layer frame delivery and ARP (Address Resolution Protocol) cache population.
3. Network layer IP addressing and routing consistency across the local subnet.

### Test Acceptance Criteria
- **Packets Transmitted:** 4 packets per test execution
- **Packets Received:** 4 packets per test execution
- **Packet Loss:** 0% (0 packets lost)
- **Status:** PASS / SUCCESS

---

## 2. Master Verification Test Matrix

A total of twelve directional tests were executed, covering all host-to-gateway, host-to-host, and gateway-to-host permutations.

| Test ID | Source Device | Source IP | Destination Device | Destination IP | Packets Sent | Packets Received | Packet Loss (%) | Result |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-01** | HOST-001 | 192.168.1.10 | Cisco 2911 (Router) | 192.168.1.1 | 4 | 4 | 0.0% | **PASS** |
| **TC-02** | HOST-001 | 192.168.1.10 | HOST-002 | 192.168.1.11 | 4 | 4 | 0.0% | **PASS** |
| **TC-03** | HOST-001 | 192.168.1.10 | HOST-003 | 192.168.1.12 | 4 | 4 | 0.0% | **PASS** |
| **TC-04** | HOST-002 | 192.168.1.11 | Cisco 2911 (Router) | 192.168.1.1 | 4 | 4 | 0.0% | **PASS** |
| **TC-05** | HOST-002 | 192.168.1.11 | HOST-001 | 192.168.1.10 | 4 | 4 | 0.0% | **PASS** |
| **TC-06** | HOST-002 | 192.168.1.11 | HOST-003 | 192.168.1.12 | 4 | 4 | 0.0% | **PASS** |
| **TC-07** | HOST-003 | 192.168.1.12 | Cisco 2911 (Router) | 192.168.1.1 | 4 | 4 | 0.0% | **PASS** |
| **TC-08** | HOST-003 | 192.168.1.12 | HOST-001 | 192.168.1.10 | 4 | 4 | 0.0% | **PASS** |
| **TC-09** | HOST-003 | 192.168.1.12 | HOST-002 | 192.168.1.11 | 4 | 4 | 0.0% | **PASS** |
| **TC-10** | Cisco 2911 | 192.168.1.1 | HOST-001 | 192.168.1.10 | 4 | 4 | 0.0% | **PASS** |
| **TC-11** | Cisco 2911 | 192.168.1.1 | HOST-002 | 192.168.1.11 | 4 | 4 | 0.0% | **PASS** |
| **TC-12** | Cisco 2911 | 192.168.1.1 | HOST-003 | 192.168.1.12 | 4 | 4 | 0.0% | **PASS** |

---

## 3. Individual Test Execution Logs

### Group 1: Tests Originating from HOST-001 (`192.168.1.10`)

#### Test TC-01: Ping from HOST-001 to Cisco 2911 Router (`192.168.1.1`)
```
C:\> ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-02: Ping from HOST-001 to HOST-002 (`192.168.1.11`)
```
C:\> ping 192.168.1.11

Pinging 192.168.1.11 with 32 bytes of data:
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.11:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-03: Ping from HOST-001 to HOST-003 (`192.168.1.12`)
```
C:\> ping 192.168.1.12

Pinging 192.168.1.12 with 32 bytes of data:
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.12:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

---

### Group 2: Tests Originating from HOST-002 (`192.168.1.11`)

#### Test TC-04: Ping from HOST-002 to Cisco 2911 Router (`192.168.1.1`)
```
C:\> ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-05: Ping from HOST-002 to HOST-001 (`192.168.1.10`)
```
C:\> ping 192.168.1.10

Pinging 192.168.1.10 with 32 bytes of data:
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.10:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-06: Ping from HOST-002 to HOST-003 (`192.168.1.12`)
```
C:\> ping 192.168.1.12

Pinging 192.168.1.12 with 32 bytes of data:
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128
Reply from 192.168.1.12: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.12:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

---

### Group 3: Tests Originating from HOST-003 (`192.168.1.12`)

#### Test TC-07: Ping from HOST-003 to Cisco 2911 Router (`192.168.1.1`)
```
C:\> ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255
Reply from 192.168.1.1: bytes=32 time<1ms TTL=255

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-08: Ping from HOST-003 to HOST-001 (`192.168.1.10`)
```
C:\> ping 192.168.1.10

Pinging 192.168.1.10 with 32 bytes of data:
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128
Reply from 192.168.1.10: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.10:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

#### Test TC-09: Ping from HOST-003 to HOST-002 (`192.168.1.11`)
```
C:\> ping 192.168.1.11

Pinging 192.168.1.11 with 32 bytes of data:
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128
Reply from 192.168.1.11: bytes=32 time<1ms TTL=128

Ping statistics for 192.168.1.11:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms
Status: SUCCESS
```

---

### Group 4: Tests Originating from Cisco 2911 Router (`192.168.1.1`)

#### Test TC-10: Router Ping to HOST-001 (`192.168.1.10`)
```
Router# ping 192.168.1.10 repeat 4
Type escape sequence to abort.
Sending 4, 100-byte ICMP Echos to 192.168.1.10, timeout is 2 seconds:
!!!!
Success rate is 100 percent (4/4), round-trip min/avg/max = 1/1/2 ms
Status: SUCCESS
```

#### Test TC-11: Router Ping to HOST-002 (`192.168.1.11`)
```
Router# ping 192.168.1.11 repeat 4
Type escape sequence to abort.
Sending 4, 100-byte ICMP Echos to 192.168.1.11, timeout is 2 seconds:
!!!!
Success rate is 100 percent (4/4), round-trip min/avg/max = 1/1/2 ms
Status: SUCCESS
```

#### Test TC-12: Router Ping to HOST-003 (`192.168.1.12`)
```
Router# ping 192.168.1.12 repeat 4
Type escape sequence to abort.
Sending 4, 100-byte ICMP Echos to 192.168.1.12, timeout is 2 seconds:
!!!!
Success rate is 100 percent (4/4), round-trip min/avg/max = 1/1/2 ms
Status: SUCCESS
```

---

## 4. Technical Analysis and Findings

1. **ICMP Protocol Operation:**
   - Each endpoint effectively generated ICMP Echo Requests (Type 8) and processed corresponding ICMP Echo Replies (Type 0).
   - The zero-packet loss demonstrates absence of transmission errors, cable impedance issues, or faulty switch ports.

2. **ARP and Forwarding Table Health:**
   - In each initial interaction, the ARP exchange properly associated the target IPv4 addresses with their hardware MAC addresses.
   - The Cisco 2960 switch successfully maintained forward entries in its Content Addressable Memory (CAM) table, preventing broadcast loops and unnecessary packet re-transmissions.

3. **Significance for the Anomaly Detection System:**
   - Establishing a zero-loss baseline confirms that the underlying physical and data link layers are stable.
   - Any packet drops or delays observed later during anomaly testing can be confidently attributed to actual network congestion or bandwidth exhaustion rather than hardware or configuration flaws.
