
# Network Bandwidth Anomaly Detection System

A web-based network bandwidth monitoring system that identifies unusual bandwidth usage using a Finite State Machine (FSM).

## Project Overview

This project monitors network hosts and their bandwidth usage. It classifies bandwidth readings into input symbols and uses an FSM to identify normal, high, suspicious and blocked states.

## Technologies Used

- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Node.js and Express.js
- Database: MongoDB
- Automata Theory: Finite State Machine (FSM)
- Development Tools: Visual Studio Code

## Main Features

- Network host registration and management
- Bandwidth reading submission
- Automatic bandwidth classification
- FSM-based anomaly detection
- Bandwidth history monitoring
- Anomaly alert generation and acknowledgement
- CSV bandwidth data upload
- Administrator FSM reset
- Automata state transition diagram and table

## FSM Design

### States

| State | Meaning |
|---|---|
| S0 | Normal |
| S1 | High Usage |
| S2 | Suspicious |
| S3 | Blocked (Trap State) |

### Input Alphabet

`Σ = {L, H, S, B, R}`

| Symbol | Bandwidth Range / Meaning |
|---|---|
| L | 0–50 Mbps |
| H | Above 50–100 Mbps |
| S | Above 100–200 Mbps |
| B | Above 200 Mbps |
| R | Administrator reset |

The initial state is S0. State S3 is the trap state. Inputs L, H, S and B keep the machine in S3. Administrator reset input R returns the FSM to S0.

Refer to [FSM Design](docs/FSM-Design.md) for the complete transition diagram and transition table.

## Project Structure

```text
Network-Bandwidth-Detection/
│
├── client/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── logic/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── docs/
    └── FSM-Design.md
```

## Installation and Execution

### Prerequisites

- Node.js and npm
- MongoDB running locally
- Visual Studio Code

### 1. Start the Backend

Open a terminal:

```bash
cd server
npm install
npm start
```

Backend URL: `http://localhost:5000`

### 2. Start the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the frontend URL shown in the terminal (normally `http://localhost:3000/`).

Make sure MongoDB is running before starting the backend.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/hosts` | Register a host |
| GET | `/api/hosts` | Retrieve hosts |
| GET | `/api/hosts/:hostId` | Retrieve a specific host |
| POST | `/api/bandwidth` | Submit a bandwidth reading |
| GET | `/api/bandwidth/:hostId/history` | Retrieve host bandwidth history |
| GET | `/api/alerts` | Retrieve anomaly alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| POST | `/api/hosts/:hostId/reset` | Reset the host FSM state |

## Testing

The FSM logic has been tested for:

- Regular expression validation
- Bandwidth symbol classification
- State transitions
- Trap state behaviour
- Administrator reset
- Invalid input handling

The frontend production build has also been verified using:

```bash
npm run build
```

## Expected Outcome

The system provides a dashboard to monitor network bandwidth, identify abnormal usage, view alerts and demonstrate FSM-based state transitions.

## Academic Domain

- Full Stack Web Development
- Formal Languages and Automata Theory
- Network Monitoring and Anomaly Detection
