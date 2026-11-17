# FSM State Transition Table Specification
**Project:** Network Bandwidth Usage Anomaly Detection System  
**Module:** Formal Languages & Automata Theory (FLAT)  
**Document Name:** `Transition_Table.md`  

---

## 1. Overview and Purpose

In our **Network Bandwidth Usage Anomaly Detection System**, the state of any monitored network host (e.g., `HOST-001`) is modeled using a Deterministic Finite Automaton (DFA). The **State Transition Table** is the tabular representation of the formal transition function:

$$\delta: Q \times \Sigma \to Q$$

It specifies exactly which state the host transitions into when an input event or bandwidth reading is observed.

---

## 2. States and Input Alphabet Definitions

### 2.1 Set of States ($Q$)
The system defines four discrete operational states:
- **$S_0$ (Normal):** The host operates within standard, healthy network parameters.
- **$S_1$ (High Usage):** The host consumes elevated bandwidth, but remains within acceptable limits.
- **$S_2$ (Suspicious):** The host demonstrates unusually high bandwidth consumption, triggering administrative warnings.
- **$S_3$ (Blocked):** The host has committed an anomaly violation (e.g., volumetric burst or exfiltration) and is quarantined in a trap state.

### 2.2 Input Alphabet ($\Sigma$)
Continuous bandwidth readings (measured in Mbps) are mapped into discrete alphabet symbols based on established thresholds:

$$\Sigma = \{L, H, S, B, R\}$$

| Symbol | Bandwidth Range | Semantic Definition | Typical Scenario |
| :---: | :--- | :--- | :--- |
| **L** | **$0$ to $50\text{ Mbps}$** | **Low / Normal Usage** | Basic browsing, email, API heartbeats. |
| **H** | **Above $50$ to $100\text{ Mbps}$** | **High Usage** | Video conferencing, large downloads, backups. |
| **S** | **Above $100$ to $200\text{ Mbps}$** | **Suspicious Usage** | High-volume file transfers, unapproved p2p traffic. |
| **B** | **Above $200\text{ Mbps}$** | **Extreme Burst / Anomaly** | DDoS flooding, botnet activity, data dumping. |
| **R** | **N/A (Admin Action)** | **Administrator Reset** | Manual security unlock from the dashboard. |

---

## 3. The Complete State Transition Table

The following matrix represents all $4 \times 5 = 20$ transitions of the automaton:

| Current State | L ($0$–$50$ Mbps) | H ($>50$–$100$ Mbps) | S ($>100$–$200$ Mbps) | B ($>200$ Mbps) | R (Admin Reset) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **$S_0$ (Normal)** | **$S_0$** | **$S_1$** | **$S_2$** | **$S_3$** | **$S_0$** |
| **$S_1$ (High Usage)** | **$S_0$** | **$S_1$** | **$S_2$** | **$S_3$** | **$S_0$** |
| **$S_2$ (Suspicious)** | **$S_0$** | **$S_1$** | **$S_2$** | **$S_3$** | **$S_0$** |
| **$S_3$ (Blocked)** | **$S_3$** | **$S_3$** | **$S_3$** | **$S_3$** | **$S_0$** |

---

## 4. Detailed Explanation of Every Transition

### 4.1 Transitions from State $S_0$ (Normal)
When `HOST-001` is operating normally in state $S_0$:
- $\delta(S_0, L) = S_0$: Bandwidth is low ($0$–$50\text{ Mbps}$). The host remains in **Normal**.
- $\delta(S_0, H) = S_1$: Bandwidth rises to high ($51$–$100\text{ Mbps}$). The host moves to **High Usage**.
- $\delta(S_0, S) = S_2$: Bandwidth spikes to suspicious levels ($101$–$200\text{ Mbps}$). The host escalates to **Suspicious**.
- $\delta(S_0, B) = S_3$: Bandwidth surges above $200\text{ Mbps}$. An immediate anomaly is flagged; host moves to **Blocked**.
- $\delta(S_0, R) = S_0$: Administrator issues a reset on a normal host. State remains unchanged in **Normal**.

### 4.2 Transitions from State $S_1$ (High Usage)
When `HOST-001` is in elevated state $S_1$:
- $\delta(S_1, L) = S_0$: Bandwidth subsides to normal levels ($0$–$50\text{ Mbps}$). Host de-escalates back to **Normal**.
- $\delta(S_1, H) = S_1$: Bandwidth remains high ($51$–$100\text{ Mbps}$). Host stays in **High Usage**.
- $\delta(S_1, S) = S_2$: Bandwidth increases to suspicious levels ($101$–$200\text{ Mbps}$). Host escalates to **Suspicious**.
- $\delta(S_1, B) = S_3$: Bandwidth surges above $200\text{ Mbps}$. Host escalates directly to **Blocked**.
- $\delta(S_1, R) = S_0$: Administrator manual reset forces the host back to **Normal**.

### 4.3 Transitions from State $S_2$ (Suspicious)
When `HOST-001` is flagged as warning/suspicious in state $S_2$:
- $\delta(S_2, L) = S_0$: Bandwidth drops significantly to normal ($0$–$50\text{ Mbps}$). Host recovers to **Normal**.
- $\delta(S_2, H) = S_1$: Bandwidth drops moderately ($51$–$100\text{ Mbps}$). Host de-escalates to **High Usage**.
- $\delta(S_2, S) = S_2$: Bandwidth remains suspicious ($101$–$200\text{ Mbps}$). Host remains in **Suspicious**.
- $\delta(S_2, B) = S_3$: Bandwidth exceeds $200\text{ Mbps}$. Host crosses critical threshold and transitions to **Blocked**.
- $\delta(S_2, R) = S_0$: Administrator verifies the traffic and resets host back to **Normal**.

### 4.4 Transitions from State $S_3$ (Blocked / Quarantined)
When `HOST-001` has violated security policies and is placed into quarantine in state $S_3$:
- $\delta(S_3, L) = S_3$: Bandwidth drops to $0$–$50\text{ Mbps}$. **Host remains Blocked.**
- $\delta(S_3, H) = S_3$: Bandwidth is $51$–$100\text{ Mbps}$. **Host remains Blocked.**
- $\delta(S_3, S) = S_3$: Bandwidth is $101$–$200\text{ Mbps}$. **Host remains Blocked.**
- $\delta(S_3, B) = S_3$: Bandwidth remains $>200\text{ Mbps}$. **Host remains Blocked.**
- $\delta(S_3, R) = S_0$: **Administrator Manual Reset.** The only valid exit from quarantine, restoring the host to **Normal**.

---

## 5. Trap-State and Admin-Reset Mechanism

### 5.1 The Trap State Property of $S_3$
In automata theory, a **trap state** (or dead state) is a state from which the automaton cannot escape under regular operational inputs:

$$\forall \sigma \in \{L, H, S, B\}, \quad \delta(S_3, \sigma) = S_3$$

#### Why This is Vital for Network Security
1. **Prevents Attacker Evasion:** A compromised host or malware program might flood the network at $400\text{ Mbps}$ and then suddenly reduce transmission to $10\text{ Mbps}$ to evade detection. If the FSM allowed $L$ to transition $S_3 \to S_0$, the attack could pulse indefinitely without remediation.
2. **Guarantees Quarantine Enforcement:** Software firewalls and Packet Tracer ACL rules must keep the host quarantined until an IT administrator verifies that the threat is neutralized.

### 5.2 The Administrator Reset ($R$) Override
The symbol $R$ represents an authenticated, administrative override:
$$\delta(S_3, R) = S_0$$
- It is triggered strictly through the secure administrative dashboard.
- It requires human review (e.g., verifying Packet Tracer simulation results or endpoint antivirus scans).
- Once executed, the host's record in MongoDB is updated from `S3` to `S0`, clear notification is broadcast to the React dashboard, and normal traffic forwarding resumes.
