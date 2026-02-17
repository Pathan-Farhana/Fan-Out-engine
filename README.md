

High-Throughput Distributed Fan-Out & Transformation Engine

Vortex is a Java 21–based Distributed Data Fan-Out Engine designed to process massive flat files (100GB+) and propagate records to multiple downstream systems safely and efficiently.

This repository contains the monitoring dashboard, architectural documentation, and reference implementation concepts for the core engine.

---

## Overview

Modern data pipelines often require a single source of truth to be distributed across heterogeneous systems such as:

* REST APIs
* gRPC services
* Message Queues (Kafka/RabbitMQ)
* Wide-column databases (Cassandra/ScyllaDB/DynamoDB)

Vortex provides a scalable, resilient, and extensible solution for streaming ingestion, transformation, and controlled distribution — with strict guarantees around memory usage and zero data loss.

---

# Architecture

## 1. Ingestion Layer (Streaming Producer)

* Supports CSV, JSONL, and fixed-width files
* Processes files using streaming I/O (BufferedReader / NIO)
* Does not load entire file into memory
* Designed to run under `-Xmx512m` regardless of file size

Each record is read sequentially and pushed into a bounded buffer.

---

## 2. Transformation Layer (Strategy Pattern)

The transformation layer decouples source format from sink format using the Strategy pattern.

Supported transformations:

* Source → JSON (REST Sink)
* Source → Protobuf (gRPC Sink)
* Source → XML (Message Queue Sink)
* Source → Avro / CQL Map (Wide-Column DB Sink)

New sink formats can be added without modifying the core orchestrator.

---

## 3. Distribution Layer (Parallel Dispatchers)

Each sink is implemented as an asynchronous dispatcher:

* REST Sink (HTTP/2 simulation)
* gRPC Sink (Unary / Streaming simulation)
* Message Queue Sink
* Wide-Column DB Sink (Async UPSERT simulation)

Dispatchers run concurrently using **Java 21 Virtual Threads**, allowing thousands of lightweight tasks without the overhead of platform threads.

---

## 4. Backpressure & Flow Control

To prevent OutOfMemoryError under slow sinks:

* A bounded `BlockingQueue` connects ingestion and distribution.
* When the queue is full, ingestion blocks.
* Backpressure propagates naturally from slow sinks to the file reader.

This guarantees controlled memory growth and stability under load.

---

## 5. Throttling & Rate Limiting

Each sink has a configurable rate limit defined in `application.yaml`.

Examples:

* REST: 50 req/sec
* gRPC: 200 req/sec
* DB: 1000 writes/sec

Rate limiting ensures downstream systems are not overwhelmed.

---

## 6. Resilience & Error Handling

Each record follows a controlled lifecycle:

1. Attempt
2. Retry (up to 3 times)
3. Failure → Dead Letter Queue (DLQ)

Retries use exponential backoff.

Zero Data Loss Guarantee:
Every input record is accounted for as either:

* Success
* Failed (persisted in DLQ)

---

# Concurrency Model

Vortex uses **Virtual Threads (Java 21)** for sink execution.

Why Virtual Threads:

* Lightweight
* Efficient blocking I/O handling
* Scales linearly with CPU cores
* Avoids complex thread pool tuning

No shared mutable state across sinks → no race conditions.

---

# Observability

The engine emits status updates every 5 seconds:

* Total records processed
* Throughput (records/sec)
* Success count per sink
* Failure count per sink
* Buffer occupancy (backpressure indicator)

---

# Design Patterns Used

* Strategy Pattern (Transformers)
* Factory Pattern (Sink creation)
* Observer-style metrics reporting
* Producer–Consumer (BlockingQueue)

---

# Dashboard & Monitoring

This repository includes a React-based monitoring dashboard that visualizes:

* Real-time throughput
* Buffer pressure
* Sink-level success/failure metrics
* Architectural data flow explanation

It also includes an AI-assisted code lab for exploring reference Java snippets.

---

# Getting Started

## Prerequisites

* Node.js (for dashboard)
* Java 21+ (for engine reference)
* Google Gemini API Key (for AI Code Lab)

---

## Run the Dashboard

1. Install dependencies:

```
npm install
```

2. Set your API key:

Create `.env.local`:

```
GEMINI_API_KEY=your_api_key_here
```

3. Start development server:

```
npm run dev
```

---

# Repository Structure

```
/src              → Dashboard source code
/docs             → Architecture notes & diagrams
/sample-data      → Example input files
/config           → Sample configuration files
README.md         → Documentation
```

---

# Assumptions

* Downstream sinks are network-bound services
* Network latency is variable
* File sizes may exceed 100GB
* Rate limits are externally defined
* Exactly-once delivery is simulated

---

# AI Prompts Used

The following prompts were used to generate engineering artifacts:

* "Generate Java 21 Virtual Thread fan-out dispatcher."
* "Design a streaming ingestion system for 100GB files."
* "Implement backpressure using BlockingQueue in Java."
* "Create retry logic with exponential backoff and DLQ."

---

# Purpose

This project demonstrates:

* High-throughput backend system design
* Streaming data processing
* Concurrency at scale
* Backpressure management
* Resilience engineering
* Extensible architecture design

