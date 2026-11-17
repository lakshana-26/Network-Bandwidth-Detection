# Regex Validation Design Document
**Project:** Network Bandwidth Usage Anomaly Detection System  
**Module:** Formal Languages & Automata Theory (FLAT)  
**Document Name:** `Regex_Validation_Design.md`  

---

## 1. Purpose of Regular Expression Validation

In the **Network Bandwidth Usage Anomaly Detection System**, the ingestion pipeline continuously receives telemetry records from various network hosts, routers, and monitoring agents. Before running any anomaly detection or classification algorithms, the system must guarantee that incoming data conforms strictly to expected syntactic rules.

Regular Expressions (Regex) provide a formal, mathematically rigorous mechanism (grounded in Chomsky Type-3 Regular Languages) to perform **lexical syntax validation**.

### Key Objectives
1. **Data Integrity:** Prevent corrupted, truncated, or improperly formatted telemetry records from entering the database and processing pipeline.
2. **Early Rejection:** Discard malformed requests at the API boundary, saving downstream compute, memory, and database I/O.
3. **Security & Injection Defense:** Enforce strict whitelisting of allowable characters, neutralizing format-string attacks, NoSQL injection patterns, and buffer-overflow payloads.
4. **Separation of Concerns:** Keep syntax verification (format correctness) distinct from behavior analysis (anomaly detection).

---

## 2. Field-by-Field Validation Specifications

Every network log entry processed by the system consists of five essential attributes:
1. `Host ID`
2. `Source IP` & `Destination IP` (IPv4)
3. `Bandwidth Usage`
4. `Timestamp`

---

### 2.1 Host ID Format & Validation

#### Specification
A Host ID uniquely identifies a monitored node, server, or client machine in the network infrastructure.
- **Prefix:** An uppercase category prefix representing device type:
  - `HOST` (End-user workstation / host)
  - `SRV` (Internal or edge server)
  - `NODE` (Switch, router, or cluster node)
- **Delimiter:** A single hyphen (`-`).
- **Identifier:** Exactly 3 to 5 numeric digits (e.g., `001`, `1042`, `99999`).

#### Regular Expression
```regex
^(HOST|SRV|NODE)-\d{3,5}$
```

#### Token Breakdown
- `^` : Asserts the start of the string.
- `(HOST|SRV|NODE)` : Matches one of the three permitted uppercase prefixes.
- `-` : Matches the literal hyphen separator.
- `\d{3,5}` : Matches between 3 and 5 decimal digits (`0`–`9`).
- `$` : Asserts the end of the string.

---

### 2.2 IPv4 Address Validation Rules

#### Specification
An IPv4 address consists of four decimal octets separated by periods (`.`). Each octet must represent an 8-bit integer in the range `0` to `255`.

A naive pattern such as `\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}` is **insufficient** because it permits invalid values such as `999.300.256.1`.

#### Single Octet Logic (0 to 255)
An octet can be partitioned into numeric ranges:
- `25[0-5]` : Handles `250` through `255`.
- `2[0-4]\d` : Handles `200` through `249`.
- `1\d\d` : Handles `100` through `199`.
- `[1-9]?\d` : Handles `0` through `99` (disallows non-standard multi-digit leading zeros like `00` or `012`).

Combined Octet Pattern:
```regex
(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)
```

#### Complete IPv4 Regular Expression
```regex
^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$
```

#### Token Breakdown
- `^` : Start of string anchor.
- `(` ... `\.){3}` : Matches three consecutive octets, each immediately followed by a literal dot (`.`).
- `(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)` : Matches the fourth and final octet (without a trailing dot).
- `$` : End of string anchor.

---

### 2.3 Non-Negative Bandwidth Validation Rules

#### Specification
Bandwidth consumption represents instantaneous or interval network transfer speed measured in Megabits per second (**Mbps**).
- Must be a non-negative number ($\ge 0$).
- Negative numbers (e.g., `-15.4`) are physically impossible and invalid.
- Can be an integer (e.g., `0`, `50`) or a decimal value up to two decimal places (e.g., `12.75`, `0.5`).
- Must not have superfluous leading zeros (e.g., `05` is invalid, but `0` or `0.75` is valid).

#### Regular Expression
```regex
^(0|[1-9]\d*)(\.\d{1,2})?$
```

#### Token Breakdown
- `^` : Asserts the start of the string.
- `(0|[1-9]\d*)` : Matches the whole-number portion:
  - `0` : Single zero by itself.
  - `|` : OR
  - `[1-9]\d*` : A non-zero leading digit followed by zero or more digits (prevents inputs like `0123`).
- `(\.\d{1,2})?` : Optional fractional component:
  - `\.` : Literal decimal point.
  - `\d{1,2}` : Exactly 1 or 2 fractional digits.
  - `?` : Makes the entire decimal portion optional.
- `$` : Asserts the end of the string.

---

### 2.4 Timestamp Format & Validation

#### Specification
All telemetry timestamps must adhere to the standardized format:
```
YYYY-MM-DD HH:MM:SS
```
Where:
- `YYYY` : 4-digit calendar year (e.g., `2000`–`2099`).
- `MM` : 2-digit month (`01`–`12`).
- `DD` : 2-digit day (`01`–`31`).
- ` ` : Single whitespace separator.
- `HH` : 2-digit 24-hour format hour (`00`–`23`).
- `MM` : 2-digit minute (`00`–`59`).
- `SS` : 2-digit second (`00`–`59`).

#### Syntactic Regular Expression (Lexical Match)
```regex
^(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$
```

#### Token Breakdown
- `^(20\d{2})` : Matches years in the 21st century (`2000` to `2099`).
- `-(0[1-9]|1[0-2])` : Literal hyphen followed by month `01` through `12`.
- `-(0[1-9]|[12]\d|3[01])` : Literal hyphen followed by day `01` through `31`.
- ` ` : Literal space delimiter.
- `([01]\d|2[0-3])` : Hour in 24-hour range (`00` to `23`).
- `:([0-5]\d)` : Literal colon followed by minute (`00` to `59`).
- `:([0-5]\d)$` : Literal colon followed by second (`00` to `59`) and end of string.

---

### 2.5 Important Note: Lexical Regex vs. Semantic Date Validation

> **Theoretical Limitation of Regular Expressions:**  
> A regular expression is equivalent to a Finite State Automaton with a **finite number of memoryless states**. It cannot perform arithmetic cross-comparisons between disparate groups (e.g., determining whether a specific 4-digit year is divisible by 4 and not 100, or divisible by 400).
>
> Therefore, while the regex guarantees the string strictly resembles a timestamp, it **cannot and should not be claimed to fully verify real calendar validity**.

#### Examples of Strings Passing Regex but Semantically Invalid
- `2026-02-31 14:00:00` : February never contains 31 days.
- `2026-04-31 09:30:00` : April contains only 30 days.
- `2025-02-29 12:00:00` : 2025 is not a leap year; February 29 does not exist.

#### Two-Stage Validation Architecture
To maintain correctness, our pipeline implements a two-stage gatekeeper:
1. **Stage 1 (Syntax via Regex):** Checks lexical conformity against `YYYY-MM-DD HH:MM:SS`. If this fails, reject immediately.
2. **Stage 2 (Semantic Date Verification):** Parse year, month, and day into calendar components and verify:
   - Days in month match calendar limits (30 days for Apr, Jun, Sep, Nov; 31 for Jan, Mar, May, Jul, Aug, Oct, Dec).
   - Leap year calculation for February:
     $$\text{isLeapYear} = (\text{Year} \pmod 4 = 0 \land \text{Year} \pmod{100} \neq 0) \lor (\text{Year} \pmod{400} = 0)$$
     If leap year $\rightarrow$ Feb has 29 days; otherwise $\rightarrow$ Feb has 28 days.

---

## 3. Comprehensive Test Cases Matrix

The following test suites cover boundary values, typical cases, and malicious or malformed inputs for every field.

### 3.1 Host ID Test Cases
| Test ID | Input Value | Expected Regex Result | Reason / Explanation |
| :--- | :--- | :---: | :--- |
| `TC-HID-01` | `HOST-001` | **VALID** | Standard host prefix with 3 digits. |
| `TC-HID-02` | `SRV-1024` | **VALID** | Standard server prefix with 4 digits. |
| `TC-HID-03` | `NODE-99999` | **VALID** | Standard node prefix with maximum allowed (5) digits. |
| `TC-HID-04` | `host-001` | **INVALID** | Lowercase letters not permitted. |
| `TC-HID-05` | `CLIENT-101` | **INVALID** | Prefix `CLIENT` is not in allowed set (`HOST`, `SRV`, `NODE`). |
| `TC-HID-06` | `HOST-12` | **INVALID** | Only 2 digits; minimum required is 3. |
| `TC-HID-07` | `SRV-100000` | **INVALID** | 6 digits; maximum allowed is 5. |
| `TC-HID-08` | `HOST_101` | **INVALID** | Underscore used instead of hyphen. |
| `TC-HID-09` | `HOST-10A` | **INVALID** | Contains non-numeric character `A` in ID portion. |
| `TC-HID-10` | `HOST-` | **INVALID** | Missing numeric identifier. |

---

### 3.2 IPv4 Address Test Cases
| Test ID | Input Value | Expected Regex Result | Reason / Explanation |
| :--- | :--- | :---: | :--- |
| `TC-IP-01` | `192.168.1.1` | **VALID** | Typical private Class C IP. |
| `TC-IP-02` | `10.0.0.1` | **VALID** | Valid single-digit octets and boundaries. |
| `TC-IP-03` | `255.255.255.255` | **VALID** | Upper boundary for all four octets. |
| `TC-IP-04` | `0.0.0.0` | **VALID** | Lower boundary for all four octets. |
| `TC-IP-05` | `172.16.254.1` | **VALID** | Standard corporate subnet IP. |
| `TC-IP-06` | `256.100.0.1` | **INVALID** | First octet `256` exceeds maximum allowable 255. |
| `TC-IP-07` | `192.168.1` | **INVALID** | Incomplete address; only 3 octets present. |
| `TC-IP-08` | `192.168.1.1.5` | **INVALID** | Malformed address; contains 5 octets. |
| `TC-IP-09` | `192.168.01.1` | **INVALID** | Leading zero in octet `01`. |
| `TC-IP-10` | `192.168.-1.5` | **INVALID** | Negative number in octet. |
| `TC-IP-11` | `192.168.1.abc` | **INVALID** | Alphabetical characters in octet. |

---

### 3.3 Bandwidth Usage Test Cases
| Test ID | Input Value | Expected Regex Result | Reason / Explanation |
| :--- | :--- | :---: | :--- |
| `TC-BW-01` | `0` | **VALID** | Zero bandwidth (idle host). |
| `TC-BW-02` | `45` | **VALID** | Valid positive integer bandwidth. |
| `TC-BW-03` | `120.5` | **VALID** | Positive decimal with 1 decimal digit. |
| `TC-BW-04` | `984.75` | **VALID** | Positive decimal with 2 decimal digits. |
| `TC-BW-05` | `10000` | **VALID** | High bandwidth valid integer. |
| `TC-BW-06` | `-50` | **INVALID** | Negative values are strictly forbidden. |
| `TC-BW-07` | `-0.25` | **INVALID** | Negative fractional value. |
| `TC-BW-08` | `050` | **INVALID** | Unwanted leading zero on integer. |
| `TC-BW-09` | `12.345` | **INVALID** | Exceeds 2 decimal digits precision limit. |
| `TC-BW-10` | `.75` | **INVALID** | Missing leading zero before decimal point. |
| `TC-BW-11` | `50.` | **INVALID** | Trailing decimal point without following digits. |
| `TC-BW-12` | `100 Mbps` | **INVALID** | Units should not be included in raw metric value. |

---

### 3.4 Timestamp Test Cases (Regex + Semantic)
| Test ID | Input Value | Regex Check | Semantic Check | Final Status | Reason / Explanation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `TC-TS-01` | `2026-11-12 14:30:00` | **PASS** | **PASS** | **VALID** | Valid timestamp in correct syntax and valid calendar date. |
| `TC-TS-02` | `2024-02-29 23:59:59` | **PASS** | **PASS** | **VALID** | 2024 is a leap year; Feb 29 is valid. |
| `TC-TS-03` | `2026-02-29 12:00:00` | **PASS** | **FAIL** | **INVALID** | Syntax passes, but 2026 is not a leap year. Feb 29 does not exist. |
| `TC-TS-04` | `2026-04-31 08:15:30` | **PASS** | **FAIL** | **INVALID** | Syntax passes, but April only has 30 days. |
| `TC-TS-05` | `2026-13-01 10:00:00` | **FAIL** | N/A | **INVALID** | Month `13` fails regex range (`01`–`12`). |
| `TC-TS-06` | `2026-05-32 10:00:00` | **FAIL** | N/A | **INVALID** | Day `32` fails regex range (`01`–`31`). |
| `TC-TS-07` | `2026-08-15 24:00:00` | **FAIL** | N/A | **INVALID** | Hour `24` is invalid in 24-hr system (`00`–`23`). |
| `TC-TS-08` | `2026-08-15 12:60:00` | **FAIL** | N/A | **INVALID** | Minute `60` fails regex range (`00`–`59`). |
| `TC-TS-09` | `15/08/2026 12:00:00` | **FAIL** | N/A | **INVALID** | Incorrect date formatting (slashes instead of hyphens). |
| `TC-TS-10` | `2026-08-15T12:00:00` | **FAIL** | N/A | **INVALID** | ISO 'T' separator used instead of expected whitespace. |

---

## 4. Difference Between Regex Validation and FSM Classification

A central concept in Formal Languages and Automata Theory (FLAT) as applied to this project is recognizing the distinct roles of **Regular Expression (Regex) Validation** and **Finite State Machine (FSM) Classification**.

```
[ Raw Network Packet / Telemetry Stream ]
                   │
                   ▼
  ┌─────────────────────────────────┐
  │   Stage 1: Regex Validation     │  <-- Lexical Level: Is the input well-formed?
  │  (Chomsky Type-3 Regular Lang)  │
  └─────────────────────────────────┘
         │               │
      [Invalid]       [Valid]
         │               │
         ▼               ▼
     [ Reject ]   ┌─────────────────────────────────┐
                  │    Stage 2: Quantization &      │
                  │       FSM Classification        │  <-- Behavioral Level: What state is host in?
                  │   (State Transitions over Time) │
                  └─────────────────────────────────┘
                                 │
                                 ▼
                     [ Normal / Warning / Anomaly ]
```

### Detailed Comparison Table

| Attribute | Regular Expression (Regex) Validation | Finite State Machine (FSM) Classification |
| :--- | :--- | :--- |
| **Primary Goal** | **Syntactic / Lexical Verification:** Determines whether an incoming string token conforms to a strict structural pattern. | **Behavioral / State Classification:** Tracks dynamic operational states of a host over sequential time intervals. |
| **Target Scope** | Individual scalar fields (`hostId`, `ip`, `bandwidth`, `timestamp`). | Multi-interval usage history and categorized threshold events. |
| **Output Type** | **Boolean:** Valid (Accept) or Invalid (Reject). | **Categorical State:** `NORMAL`, `WARNING`, `ANOMALOUS` / `ATTACK`. |
| **State & Memory** | **Stateless across records:** Evaluates one isolated string at a time; forgets previous evaluations immediately. | **Stateful across records:** Retains current state ($S_t$) and updates to next state ($S_{t+1}$) based on new telemetry input. |
| **Execution Point** | **Ingress Gateway / API Layer:** Applied first before parsing or database writes. | **Core Analytics Engine:** Applied after data validation and metric discretization. |
| **Theoretical Basis** | Defined by regular expressions, parsed via Deterministic Finite Automaton (DFA) string recognizers. | Mealy/Moore Automaton or State Transition Network with domain transition logic. |

### Concrete Scenario Example
1. A packet arrives with bandwidth: `"980.5"`.
   - **Regex Validation:** Checks `^(0|[1-9]\d*)(\.\d{1,2})?$`.
   - Result: **Valid**. (It is a valid positive decimal number).
2. The packet enters the **FSM Classifier**:
   - The FSM evaluates the numerical value against configured thresholds ($\text{High} \ge 800\text{ Mbps}$).
   - If the host was in state `NORMAL` and experiences 1 spike $\rightarrow$ Moves to `WARNING`.
   - If the host receives another spike in the next interval $\rightarrow$ Moves to `ANOMALOUS_BANDWIDTH_SURGE`.

This clear separation ensures the FSM classifier operates solely on sanitized, reliable data without needing to perform low-level character parsing.
