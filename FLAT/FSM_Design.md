# Finite State Machine (FSM) Design Document
**Project:** Network Bandwidth Usage Anomaly Detection System  
**Module:** Formal Languages & Automata Theory (FLAT)  
**Document Name:** `FSM_Design.md`  

---

## 1. Introduction and Purpose of the FSM

In our **Network Bandwidth Usage Anomaly Detection System**, regular expressions (Regex) first sanitize incoming network logs to verify that fields like IP, Host ID, bandwidth, and timestamps are syntactically valid. However, syntax validation is stateless; it cannot tell whether a host's behavior over time is safe, suspicious, or dangerous.

To evaluate dynamic host behavior, we model the system as a **Deterministic Finite Automaton (DFA)**, commonly known as a **Finite State Machine (FSM)**.

### Why use an FSM for Bandwidth Anomaly Detection?
1. **Stateful Tracking:** Maintains the current health and operational status of each monitored host (e.g., `HOST-001`).
2. **Deterministic Behavior:** Given any current state and any input symbol (bandwidth reading), there is exactly one well-defined next state. There is no ambiguity or unexpected behavior.
3. **Automated Threat Escalation & Containment:** If a host suddenly consumes extreme bandwidth (indicating potential DDoS, data exfiltration, or a compromised node), the machine transitions into an isolated or blocked state.
4. **Formal Mathematical Model:** Offers a mathematically provable system structure that satisfies academic requirements in Formal Languages and Automata Theory (FLAT).

---

## 2. Definition of States

The FSM tracks each host through four discrete, mutually exclusive states:

| State Symbol | State Name | Meaning & System Interpretation |
| :---: | :--- | :--- |
| **S0** | **Normal** | **Baseline Healthy State.** Host bandwidth usage is within standard, safe operational parameters. No administrative or security action is needed. |
| **S1** | **High Usage** | **Elevated Usage State.** The host is consuming elevated bandwidth (e.g., large file download or video streaming). Traffic is monitored, but no restrictions are enforced. |
| **S2** | **Suspicious** | **Warning State.** The host is operating at high bandwidth levels that may indicate unauthorized network scanning, torrenting, or initial stages of an attack. Alerts are flagged on the dashboard. |
| **S3** | **Blocked** | **Isolated / Quarantined State (Trap State).** The host has crossed critical safety thresholds (e.g., DDoS burst or massive exfiltration). All network access for this host is revoked until an administrator manually investigates and resets it. |

---

## 3. Input Alphabet ($\Sigma$) and Threshold Mapping

Bandwidth values measured in Megabits per second (**Mbps**) are continuous numerical readings. To feed them into a formal automaton, the continuous values are quantized into discrete **input symbols**:

$$\Sigma = \{L, H, S, B, R\}$$

| Symbol | Bandwidth Range | Semantic Meaning | Example Reading |
| :---: | :--- | :--- | :---: |
| **L** | **0 to 50 Mbps** | **Low / Normal Traffic:** Standard daily tasks (web browsing, emails, messaging). | `24.5 Mbps`, `48 Mbps` |
| **H** | **Above 50 to 100 Mbps** | **High Traffic:** Routine heavy tasks (HD streaming, software updates). | `65 Mbps`, `95.2 Mbps` |
| **S** | **Above 100 to 200 Mbps** | **Suspicious Traffic:** Unusually heavy consumption requiring warning alerts. | `120 Mbps`, `185 Mbps` |
| **B** | **Above 200 Mbps** | **Burst / Extreme Traffic:** Potential anomaly, broadcast storm, or DDoS attempt. | `240 Mbps`, `850 Mbps` |
| **R** | **N/A (Admin Action)** | **Manual Administrator Reset:** Explicit reset command triggered via the security dashboard after inspecting the host. | `Admin Override` |

---

## 4. State Transition Table

The behavior of the DFA is completely specified by the following transition table:

| Current State | Input: L (0–50 Mbps) | Input: H (51–100 Mbps) | Input: S (101–200 Mbps) | Input: B (>200 Mbps) | Input: R (Admin Reset) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **S0 (Normal)** | **S0** | **S1** | **S2** | **S3** | **S0** |
| **S1 (High)** | **S0** | **S1** | **S2** | **S3** | **S0** |
| **S2 (Suspicious)** | **S0** | **S1** | **S2** | **S3** | **S0** |
| **S3 (Blocked)** | **S3** | **S3** | **S3** | **S3** | **S0** |

---

## 5. State Transition Diagram

```
                 ┌─────────────────── L, R ────────────────────┐
                 │                                             │
                 ▼                                             │
         ┌───────────────┐                  ┌───────────────┐  │
  ───►   │  S0 (Normal)  ├─────── H ───────►│ S1 (High Use) ├──┘
         └───────┬───────┘                  └───────┬───────┘
                 │       ▲                          │
                 │       │                          │
                 S       L, R                       S
                 │       │                          │
                 ▼       │                          ▼
         ┌───────────────┴┐                 ┌───────────────┐
         │ S2 (Suspicious)├─────── B ──────►│  S3 (Blocked) │◄──┐ L, H,
         └───────┬────────┘                 └───┬───────┬───┘   │ S, B
                 │                              │       │       │ (Trap)
                 └────────────── B ─────────────┘       └───┘───┘
                                                        │
                                                        │ R (Admin Reset Only)
                                                        ▼
                                                   [ Return to S0 ]
```

---

## 6. Explanation of Transitions with Practical Examples

Consider a monitored workstation `HOST-001`:

### 1. From State S0 (Normal):
- **On `L` (30 Mbps):** Remains in **S0**. The workstation continues regular web browsing.
- **On `H` (75 Mbps):** Moves to **S1**. The user starts an HD video conference; usage is elevated.
- **On `S` (140 Mbps):** Moves directly to **S2**. The user downloads multiple ISO files simultaneously; flagged as suspicious.
- **On `B` (350 Mbps):** Moves immediately to **S3**. A sudden extreme surge indicates an active malware infection or DoS flood; access is immediately cut off.
- **On `R`:** Remains in **S0** (already in normal state).

### 2. From State S1 (High Usage):
- **On `L` (20 Mbps):** Returns to **S0**. The conference ended; bandwidth has returned to baseline.
- **On `H` (80 Mbps):** Remains in **S1**. Heavy usage is sustained.
- **On `S` (160 Mbps):** Escalates to **S2**. Bandwidth increased further beyond normal limits.
- **On `B` (400 Mbps):** Escalates directly to **S3** (Emergency Quarantine).
- **On `R`:** Returns to **S0** (administrator reset).

### 3. From State S2 (Suspicious):
- **On `L` (15 Mbps):** Recovers to **S0**. The burst subsided; the host drops back to healthy.
- **On `H` (60 Mbps):** De-escalates to **S1**. Traffic lowered slightly, but still elevated.
- **On `S` (180 Mbps):** Remains in **S2**. Continued suspicious behavior; triggers admin notification.
- **On `B` (220 Mbps):** Escalates to **S3** (Blocked).
- **On `R`:** Returns to **S0**.

### 4. From State S3 (Blocked):
- **On `L`, `H`, `S`, or `B`:** **Remains in S3.** No matter how much or how little traffic the host sends, it cannot free itself.
- **On `R` (Admin Reset):** Moves back to **S0**. Only an explicit security analyst action unblocks the host.

---

## 7. Why S3 Remains Blocked Until Administrator Reset (Trap State Design)

In formal language theory, a state $q \in Q$ from which no transition can lead to another state (except via an out-of-band administrative intervention) is known as a **Trap State** (or Dead State with respect to regular operations).

### Security & Operational Justifications
1. **Preventing Automated Attack Cycling:**  
   If `S3` automatically reverted to `S0` when traffic dropped to `L` ($0$–$50\text{ Mbps}$), a malicious script could flood the network with $500\text{ Mbps}$ for 30 seconds, go silent for 5 seconds to get unblocked, and then resume flooding. The trap state eliminates this loophole.
2. **Enforcing Human-in-the-Loop Investigation:**  
   Reaching `S3` signifies a severe policy violation (bandwidth $>200\text{ Mbps}$). A security analyst must examine Packet Tracer logs, check the host for rootkits or rogue background processes, and verify safety before re-authorizing network access.
3. **Incident Accountability:**  
   The reset action generates a verifiable audit log containing the administrator's identity, timestamp, and justification.

---

## 8. Formal DFA Definition (5-Tuple)

A Deterministic Finite Automaton (DFA) is formally defined as a 5-tuple:

$$M = (Q, \Sigma, \delta, q_0, F)$$

### 1. Set of States ($Q$)
$$Q = \{S_0, S_1, S_2, S_3\}$$
- $S_0$ : Normal
- $S_1$ : High Usage
- $S_2$ : Suspicious
- $S_3$ : Blocked

### 2. Input Alphabet ($\Sigma$)
$$\Sigma = \{L, H, S, B, R\}$$
- $L$ : Low bandwidth ($[0, 50]\text{ Mbps}$)
- $H$ : High bandwidth ($(50, 100]\text{ Mbps}$)
- $S$ : Suspicious bandwidth ($(100, 200]\text{ Mbps}$)
- $B$ : Extreme burst ($>200\text{ Mbps}$)
- $R$ : Manual administrative reset

### 3. Transition Function ($\delta$)
$$\delta: Q \times \Sigma \to Q$$

Expressed mathematically:
$$\begin{aligned}
\delta(S_0, L) &= S_0, \quad \delta(S_0, H) = S_1, \quad \delta(S_0, S) = S_2, \quad \delta(S_0, B) = S_3, \quad \delta(S_0, R) = S_0 \\
\delta(S_1, L) &= S_0, \quad \delta(S_1, H) = S_1, \quad \delta(S_1, S) = S_2, \quad \delta(S_1, B) = S_3, \quad \delta(S_1, R) = S_0 \\
\delta(S_2, L) &= S_0, \quad \delta(S_2, H) = S_1, \quad \delta(S_2, S) = S_2, \quad \delta(S_2, B) = S_3, \quad \delta(S_2, R) = S_0 \\
\delta(S_3, L) &= S_3, \quad \delta(S_3, H) = S_3, \quad \delta(S_3, S) = S_3, \quad \delta(S_3, B) = S_3, \quad \delta(S_3, R) = S_0
\end{aligned}$$

### 4. Initial State ($q_0$)
$$q_0 = S_0$$
Every newly registered or monitored host starts in the **Normal ($S_0$)** state.

### 5. Set of Accepting / Final States ($F$)

In standard automata theory for pattern recognition, accepting states recognize words belonging to a specific language $\mathcal{L}(M)$. Depending on the analytical lens, two conventions can be adopted:

#### Chosen Convention for this Project: Anomaly Detection Focus
$$F = \{S_3\}$$

- **Academic Justification:**  
  Our system is an **Anomaly Detection System**. Therefore, the objective of the language recognizer is to identify sequences of events that result in an **anomaly/quarantine state**. 
  
  Thus, the language accepted by the automaton is:
  $$\mathcal{L}(M) = \{ w \in \Sigma^* \mid \text{the sequence } w \text{ leads to a quarantined/blocked state } S_3 \}$$
  
  Any input sequence ending in $S_3$ represents an identified threat string recognized by the DFA.

> **Viva Note on Alternative Convention:**  
> If an examiner asks about a "System Health" perspective where accepting means "traffic permitted", the accepting set would instead be $F = \{S_0, S_1, S_2\}$, and $S_3$ would be the non-accepting rejection state. Both conventions are mathematically sound; our project explicitly selects $F = \{S_3\}$ because the goal is **threat detection**.

---

## 9. Walkthrough of the Example Sequence

Let us trace the complete life-cycle of host `HOST-001` through the required test sequence:

$$\text{Initial State: } S_0$$
$$\text{Sequence: } 30\text{ Mbps} \longrightarrow 80\text{ Mbps} \longrightarrow 150\text{ Mbps} \longrightarrow 250\text{ Mbps} \longrightarrow \text{Admin Reset}$$

### Step-by-Step Trace Table

| Step | Current State | Reading / Event | Input Symbol | Transition Calculation | Next State | System Action & Evidence |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | — | — | — | — | **S0** | `HOST-001` starts in Normal state. |
| **1** | **S0** | `30 Mbps` | **L** ($0$–$50$) | $\delta(S_0, L) = S_0$ | **S0** | Healthy operation. Logged without warning. |
| **2** | **S0** | `80 Mbps` | **H** ($51$–$100$) | $\delta(S_0, H) = S_1$ | **S1** | Status moves to High Usage. Telemetry flagged blue/yellow. |
| **3** | **S1** | `150 Mbps` | **S** ($101$–$200$) | $\delta(S_1, S) = S_2$ | **S2** | Status escalates to Suspicious. Warning alert pushed to dashboard. |
| **4** | **S2** | `250 Mbps` | **B** ($>200$) | $\delta(S_2, B) = S_3$ | **S3** | **Anomaly Triggered!** Host quarantined. Network socket blocked. Reaches Trap State. |
| **5** | **S3** | `Admin Reset` | **R** | $\delta(S_3, R) = S_0$ | **S0** | Administrator verifies node, clears incident, and restores host to Normal. |

---

## 10. Future Backend Implementation Plan

When backend development begins in `server/logic/`, this mathematical model will be translated directly into modular, testable JavaScript logic:

### 1. Discretization Function (`server/logic/quantizer.js`)
A pure function that takes a validated numerical bandwidth float and maps it to an input symbol:
```
Bandwidth Float ──► [ Quantizer ] ──► Symbol ('L' | 'H' | 'S' | 'B')
```

### 2. Transition Lookup Matrix (`server/logic/fsmClassifier.js`)
An immutable state transition lookup dictionary:
```
TRANSITION_TABLE = {
  S0: { L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  S1: { L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  S2: { L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  S3: { L: 'S3', H: 'S3', S: 'S3', B: 'S3', R: 'S0' }
}
```

### 3. Host State Persistence (`server/models/Host.js`)
In MongoDB, each host document will persist:
- `hostId`: String (e.g., `"HOST-001"`)
- `currentState`: String enum (`'S0'`, `'S1'`, `'S2'`, `'S3'`)
- `lastBandwidth`: Number
- `lastUpdated`: Date
- `incidentHistory`: Array of state change events

### 4. API Endpoint Integration (`server/controllers/bandwidthController.js`)
- On telemetry POST:
  1. Validate fields with Regex.
  2. Quantize bandwidth to symbol.
  3. Query host's `currentState` from database.
  4. Compute `nextState = TRANSITION_TABLE[currentState][symbol]`.
  5. Update MongoDB and emit WebSocket / SSE alert to React frontend if state changes.
- On admin reset POST (`/api/hosts/:id/reset`):
  1. Verify admin authentication.
  2. Transition host from `S3` to `S0`.
  3. Append administrative audit record.
