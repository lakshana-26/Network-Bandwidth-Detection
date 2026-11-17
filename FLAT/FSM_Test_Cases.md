# FSM Test Cases and Verification Suite
**Project:** Network Bandwidth Usage Anomaly Detection System  
**Module:** Formal Languages & Automata Theory (FLAT)  
**Document Name:** `FSM_Test_Cases.md`  

---

## 1. Testing Methodology and Philosophy

The **Network Bandwidth Usage Anomaly Detection System** validates network data using a two-tier sequential approach:

```
[ Raw Ingress Telemetry ]
           │
           ▼
┌─────────────────────┐      INVALID
│  Stage 1: Regex     ├─────────────────► [ REJECT IMMEDIATELY ]
│     Validation      │                   (Log syntax error, do not call FSM)
└──────────┬──────────┘
           │ VALID
           ▼
┌─────────────────────┐
│  Stage 2: Quantizer ├─────────────────► Maps float to Symbol: L, H, S, B
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Stage 3: FSM     ├─────────────────► Evaluates δ(Current_State, Symbol)
│     Transition      │                   Updates state in Database & UI
└─────────────────────┘
```

This document specifies the comprehensive test suite verifying the behavior of `HOST-001` across regular bandwidth ranges, exact boundary conditions, malicious/negative inputs, end-to-end incident sequences, and trap-state persistence.

---

## 2. Test Suite 1: Individual Bandwidth Range Verification

This suite tests typical values firmly within the core of each of the four bandwidth ranges.

| Test ID | Host ID | Current State | Bandwidth Value | Quantized Symbol | Expected Next State | Test Outcome & Explanation |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **TC-RNG-01** | `HOST-001` | **S0** (Normal) | `25.0 Mbps` | **L** ($0$–$50$) | **S0** (Normal) | **PASS:** Normal baseline bandwidth maintains healthy status. |
| **TC-RNG-02** | `HOST-001` | **S0** (Normal) | `75.0 Mbps` | **H** ($>50$–$100$) | **S1** (High Usage) | **PASS:** Elevated streaming or downloads move host to High Usage. |
| **TC-RNG-03** | `HOST-001` | **S1** (High) | `160.0 Mbps` | **S** ($>100$–$200$) | **S2** (Suspicious) | **PASS:** Bandwidth exceeds 100 Mbps; escalates to Suspicious state. |
| **TC-RNG-04** | `HOST-001` | **S2** (Suspicious) | `275.0 Mbps` | **B** ($>200$) | **S3** (Blocked) | **PASS:** Extreme surge exceeds 200 Mbps; triggers immediate quarantine. |
| **TC-RNG-05** | `HOST-001` | **S1** (High) | `30.0 Mbps` | **L** ($0$–$50$) | **S0** (Normal) | **PASS:** High usage subsides; host successfully de-escalates to Normal. |

---

## 3. Test Suite 2: Boundary Value Analysis (BVA)

Boundary testing verifies that transition cut-offs are strictly defined and that off-by-one errors do not occur at critical thresholds:
- Threshold 1: $50\text{ Mbps}$ (Boundary between $L$ and $H$)
- Threshold 2: $100\text{ Mbps}$ (Boundary between $H$ and $S$)
- Threshold 3: $200\text{ Mbps}$ (Boundary between $S$ and $B$)

| Test ID | Current State | Bandwidth Reading | Exact Boundary Evaluated | Symbol | Expected Next State | Detailed Explanation |
| :---: | :---: | :---: | :--- | :---: | :---: | :--- |
| **TC-BVA-01** | **S0** | `0.0 Mbps` | Lower bound of $L$ ($[0, 50]$) | **L** | **S0** | Minimum possible physical bandwidth (idle link). Stays in S0. |
| **TC-BVA-02** | **S0** | `50.0 Mbps` | Upper bound of $L$ ($[0, 50]$) | **L** | **S0** | Exactly 50.0 Mbps is included in $L$. Host remains in S0. |
| **TC-BVA-03** | **S0** | `50.5 Mbps` | Lower boundary of $H$ ($(50, 100]$) | **H** | **S1** | Exceeds 50.0 Mbps; correctly classified as $H$, moving host to S1. |
| **TC-BVA-04** | **S1** | `100.0 Mbps` | Upper bound of $H$ ($(50, 100]$) | **H** | **S1** | Exactly 100.0 Mbps belongs to $H$. Host remains in S1. |
| **TC-BVA-05** | **S1** | `100.5 Mbps` | Lower boundary of $S$ ($(100, 200]$) | **S** | **S2** | Exceeds 100.0 Mbps; correctly classified as $S$, escalating to S2. |
| **TC-BVA-06** | **S2** | `200.0 Mbps` | Upper bound of $S$ ($(100, 200]$) | **S** | **S2** | Exactly 200.0 Mbps is the maximum limit of $S$. Host remains in S2. |
| **TC-BVA-07** | **S2** | `200.5 Mbps` | Lower boundary of $B$ ($>200$) | **B** | **S3** | Exceeds 200.0 Mbps; categorized as $B$, immediately triggering Blocked (S3). |

---

## 4. Test Suite 3: Negative Bandwidth Rejection (Pre-FSM Lexical Check)

Negative bandwidth values (e.g., `-50 Mbps`) are physically meaningless and indicate corrupted sensors, packet tampering, or malicious requests.

### Architectural Defense Rule:
> **The FSM must never receive or evaluate negative values.**  
> Negative values must be intercepted and rejected at **Stage 1 (Regex Validation)** before reaching the quantizer or FSM.

| Test ID | Ingress String | Stage 1: Regex Check | Stage 2: Quantizer | Stage 3: FSM State Change | System Response & Log |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **TC-NEG-01** | `"-50"` | **REJECTED (FAIL)** | Not Reached | **No Change** (Host remains in prior state) | HTTP 400 Bad Request: `"Invalid bandwidth: value must be non-negative"`. |
| **TC-NEG-02** | `"-0.01"` | **REJECTED (FAIL)** | Not Reached | **No Change** | HTTP 400 Bad Request: Regex `^(0\|[1-9]\d*)(\.\d{1,2})?$` fails. |
| **TC-NEG-03** | `"-200.5"` | **REJECTED (FAIL)** | Not Reached | **No Change** | Intercepted at API controller; telemetry discarded; security warning logged. |

---

## 5. Test Suite 4: End-to-End Walkthrough Sequence

This test traces `HOST-001` through a full operational incident life-cycle:
$$\text{Start at } S_0 \longrightarrow 30\text{ Mbps} \longrightarrow 80\text{ Mbps} \longrightarrow 150\text{ Mbps} \longrightarrow 250\text{ Mbps} \longrightarrow \text{Admin Reset}$$

### Step-by-Step Execution Trace

| Step # | Timestamp / Action | Current State | Ingress Reading | Input Symbol | Transition Formula | Expected Next State | System Action & Evidence |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Step 0** | System Boot | — | — | — | Initial State | **S0** | `HOST-001` initialized in database in state Normal. |
| **Step 1** | Regular usage | **S0** | `30.0 Mbps` | **L** | $\delta(S_0, L) = S_0$ | **S0** | Normal traffic; logged without alerts. |
| **Step 2** | Video conference | **S0** | `80.0 Mbps` | **H** | $\delta(S_0, H) = S_1$ | **S1** | Usage elevated; UI displays host with High Usage indicator. |
| **Step 3** | Bulk download | **S1** | `150.0 Mbps` | **S** | $\delta(S_1, S) = S_2$ | **S2** | Threshold warning; yellow alert pushed to admin dashboard. |
| **Step 4** | Attack / surge | **S2** | `250.0 Mbps` | **B** | $\delta(S_2, B) = S_3$ | **S3** | **Critical Anomaly!** Quarantine enforced; red alert displayed; traffic blocked. |
| **Step 5** | Admin Intervention | **S3** | Admin Reset Action | **R** | $\delta(S_3, R) = S_0$ | **S0** | Analyst clears incident in dashboard; host unlocked back to Normal ($S_0$). |

---

## 6. Test Suite 5: Trap-State Persistence (Blocked Remains Blocked)

This critical security test demonstrates that once `HOST-001` enters the quarantined state $S_3$, **a drop in bandwidth does NOT unblock the host**.

### Attack Scenario Simulated:
An attacker launches a volumetric flood of $300\text{ Mbps}$ to trigger data exfiltration. The system detects this and transitions the host to $S_3$ (Blocked). The attacker's script then cuts off traffic to $0\text{ Mbps}$ or $20\text{ Mbps}$ in an attempt to automatically trick the system into restoring normal access.

### Execution Log

| Test Step | Current State | Observed Bandwidth | Symbol | Transition Formula | Expected Next State | Verification Result |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Step 1** | **S3** (Blocked) | `20.0 Mbps` | **L** | $\delta(S_3, L) = S_3$ | **S3** (Blocked) | **PASS:** Host remains quarantined. Low traffic cannot clear quarantine. |
| **Step 2** | **S3** (Blocked) | `0.0 Mbps` | **L** | $\delta(S_3, L) = S_3$ | **S3** (Blocked) | **PASS:** Completely idle host still remains quarantined. |
| **Step 3** | **S3** (Blocked) | `75.0 Mbps` | **H** | $\delta(S_3, H) = S_3$ | **S3** (Blocked) | **PASS:** High traffic cannot alter quarantine state. |
| **Step 4** | **S3** (Blocked) | `180.0 Mbps` | **S** | $\delta(S_3, S) = S_3$ | **S3** (Blocked) | **PASS:** Suspicious traffic cannot alter quarantine state. |
| **Step 5** | **S3** (Blocked) | `Admin Reset` | **R** | $\delta(S_3, R) = S_0$ | **S0** (Normal) | **PASS:** Only authorized administrator reset unblocks host. |

---

## 7. Master Test Summary for Academic Viva

| Category | Total Tests | Pass Criteria | Viva Key Point |
| :--- | :---: | :--- | :--- |
| **Bandwidth Ranges** | 5 | All states update accurately according to symbol | Proves that the quantizer maps real numbers to alphabet $\Sigma$. |
| **Boundary Values** | 7 | Exact boundaries ($50, 100, 200\text{ Mbps}$) map without off-by-one errors | Proves strict definition of $[0, 50]$, $(50, 100]$, $(100, 200]$, and $(>200)$. |
| **Negative Bandwidth** | 3 | Rejected at Regex layer; FSM state remains untouched | Demonstrates defense-in-depth and separation of syntax from logic. |
| **Full Lifecycle** | 5 | $S_0 \to S_1 \to S_2 \to S_3 \to S_0$ | Demonstrates deterministic sequential state transitions in realistic operational conditions. |
| **Trap State Resilience**| 5 | Traffic reductions in $S_3$ stay in $S_3$; only $R$ resets to $S_0$ | Demonstrates formal trap state property and prevents attacker evasion loops. |
