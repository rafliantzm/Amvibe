# Software Specification Document (SSD)
## Amvibe Enterprise — v1.1 (Strict Enterprise Release)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Specification Document (SSD) is to establish the definitive, non-negotiable technical specifications, architectural constraints, and system behaviors for **Amvibe Enterprise**. This document serves as the absolute baseline for all engineering, security (SecOps), QA, and DevOps operations. Deviations from this document require formal architectural review and approval.

### 1.2 Document Conventions (RFC 2119)
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in IETF RFC 2119.

### 1.3 Intended Audience
- Enterprise System Architects & Lead Backend/Frontend Engineers
- Cloud Infrastructure & DevOps Engineers
- Security & Compliance Officers (SecOps)
- Database Administrators (DBAs)

### 1.4 Product Scope
Amvibe Enterprise is a mission-critical, Zero-Trust AI workspace. It orchestrates the generation of Product Requirements Documents (PRDs), Roadmaps, and Code Prompts. It enforces strict data governance, absolute separation of user and admin portals, and dynamic, highly available LLM routing mechanisms.

---

## 2. Overall Description

### 2.1 Product Perspective
Amvibe operates as a decoupled, microservices-based platform orchestrated on Kubernetes. It functions as the upstream source of truth for SDLC tools and **MUST** maintain bidirectional synchronization via Webhooks and REST APIs with external systems (Jira, Linear, GitHub).

### 2.2 Operating Environment (Strict Minimums)
- **Container Orchestration**: Kubernetes (K8s) v1.28+
- **Backend Services**: Go v1.22+ (High-throughput gateway), Node.js v20.x LTS (Application Logic)
- **Frontend Client**: Next.js 15 (React 19)
- **Primary Database**: PostgreSQL 16.x+ (Strictly enforcing `READ COMMITTED` isolation levels)
- **Caching & Pub/Sub**: Redis 7.2+
- **Vector Search**: Pinecone or self-hosted Milvus 2.3+

### 2.3 Design and Implementation Constraints
- **C-1 (Zero Trust)**: The system **MUST NOT** inherently trust any internal network request. All microservice-to-microservice communication **MUST** be authenticated via mutual TLS (mTLS).
- **C-2 (Secret Management)**: API Keys, including LLM keys, **MUST NOT** be hardcoded in environment variables or code repositories. They **MUST** be injected securely at runtime from a dedicated secrets manager (e.g., HashiCorp Vault) or pulled dynamically from the `system_configs` table.
- **C-3 (Immutability)**: Historical document versions in the database **MUST** be treated as append-only. Existing `prd_versions` rows **SHALL NOT** be updated; any revision **MUST** create a new row.

---

## 3. External Interface Requirements

### 3.1 Communications Interfaces
- **Protocol Mandates**: All client-server and server-server communication over public networks **MUST** use HTTPS enforcing TLS 1.3. TLS 1.2 is explicitly deprecated.
- **Payload Constraints**: Incoming API request bodies **MUST NOT** exceed 5MB. Requests exceeding this **SHALL** be rejected with HTTP 413 Payload Too Large.
- **Streaming Protocol**: The system **MUST** utilize Server-Sent Events (SSE) for transmitting LLM responses. WebSockets **MUST** be reserved strictly for real-time multiplayer cursor telemetry.

---

## 4. System Features & Strict Behaviors

### 4.1 Generative Document Engine (User Portal)
**Description**: The core RAG pipeline.
- **REQ-4.1.1 (Context Enforcement)**: Before generating any prompt, the backend **MUST** execute a vector similarity search to retrieve the associated enterprise architectural guidelines. The similarity threshold (e.g., Cosine Similarity) **MUST** be configured to > 0.85 to prevent hallucinations.
- **REQ-4.1.2 (Token Limiting)**: The system **MUST** truncate input prompts that exceed 80% of the active model's maximum context window to prevent HTTP 400 API errors from the LLM provider.

### 4.2 Dynamic LLM Orchestration & Fallback (Admin Portal)
**Description**: High-availability routing for AI generation.
- **REQ-4.2.1 (Configuration Polling)**: The Gateway **MUST** cache the active LLM configurations from `system_configs` in Redis, with a TTL (Time-To-Live) not exceeding 60 seconds.
- **REQ-4.2.2 (Circuit Breaker Fallback)**: If the primary LLM provider (e.g., Gemini) returns 5xx server errors or HTTP 429 (Rate Limit) for three (3) consecutive requests, the system **MUST** automatically trip the circuit breaker and route subsequent requests to the pre-configured secondary fallback model (e.g., OpenAI gpt-4o).
- **REQ-4.2.3 (Admin Override)**: The Super Admin (`raflian100@gmail.com`) **MUST** have the ability via the Admin Portal to forcefully reset the circuit breaker or manually override the active model instantly.

### 4.3 Identity & Session Governance
**Description**: Authentication and Access Control.
- **REQ-4.3.1 (Google OAuth Exclusivity)**: The system **SHALL NOT** implement standard email/password login routes. Authentication **MUST** be handled entirely by Google OAuth 2.0.
- **REQ-4.3.2 (Session Revocation)**: If the Super Admin changes a user's `status` to `BANNED`, the backend **MUST** emit an event that instantly invalidates all active JWTs and WebSocket sessions associated with that `user_id`.

---

## 5. Nonfunctional Requirements

### 5.1 Strict Performance Requirements (SLAs)
- **API Latency (Gateway)**: The API Gateway **MUST** process and route 99% (p99) of non-AI requests in under 30ms.
- **Time To First Byte (TTFB)**: During AI generation, the first chunk of the streamed response **MUST** reach the client within 1,500ms of the request being received.
- **Concurrency**: The infrastructure **MUST** support a minimum of 10,000 concurrent active users without exceeding 70% CPU utilization across the primary application clusters.

### 5.2 Security & Data Governance (SOC2 / ISO 27001 Alignment)
- **Encryption at Rest**: The PostgreSQL database and Redis volumes **MUST** be encrypted using AES-256.
- **Encryption at Application Layer**: Highly sensitive fields within the database (such as `system_configs.value` containing API keys) **MUST** be encrypted at the application layer using AES-256-GCM before database insertion.
- **Data Masking (PII)**: Any endpoint returning user data or audit logs **MUST** mask Personally Identifiable Information (PII) for roles lacking specific compliance clearance.
- **Rate Limiting**: Public-facing APIs **MUST** strictly enforce rate limits (e.g., 60 requests per minute per IP) using a distributed Redis token bucket algorithm to prevent DDoS and LLM cost-exhaustion attacks.

### 5.3 Audit & Logging
- **Audit Immutability**: All configuration changes, user role changes, and cross-system integrations **MUST** be logged in the `audit_logs` table. This table **MUST** be append-only. `UPDATE` and `DELETE` SQL privileges **SHALL NOT** be granted for this table to any application user.
- **Log Retention**: Audit logs **MUST** be retained in hot storage for 90 days and automatically archived to cold storage (e.g., AWS S3 / GCP Cloud Storage) for 7 years.

---

## 6. System Architecture & Database Specifications

### 6.1 Database Schema Strict Constraints
- **Primary Keys**: UUIDv4 **MUST** be used. Sequential integers (`SERIAL` / `AUTOINCREMENT`) are strictly forbidden.
- **Foreign Keys**: All relational linkages **MUST** employ strict database-level Foreign Key constraints (`ON DELETE CASCADE` or `RESTRICT` depending on the entity lifecycle).
- **Soft Deletes**: Main project data (Projects, PRDs, Roadmaps) **SHOULD NOT** use hard deletes. A `deleted_at` timestamp column **MUST** be utilized, and all read queries must filter out non-null `deleted_at` rows.

### 6.2 Key API Endpoints Specification

#### 6.2.1 Admin Configuration Update
- **Endpoint**: `PUT /api/v1/admin/configs`
- **Payload**: `{ "key": "GEMINI_API_KEY", "value": "AIzaSy..." }`
- **Behavior**: Encrypts the `value` via application-layer AES-256-GCM, upserts into PostgreSQL, invalidates the specific Redis cache key, and appends an entry to `audit_logs` capturing the `actor_id` and timestamp.

#### 6.2.2 Document Revision (RAG & Chat)
- **Endpoint**: `POST /api/v1/projects/{project_id}/documents/revise`
- **Payload**: `{ "document_type": "PRD", "current_version": 1, "instruction": "Add OAuth." }`
- **Behavior**: 
  1. Validates the JWT and project RBAC.
  2. Queries Pinecone for architecture constraints.
  3. Pulls active LLM API Key from Redis.
  4. Initiates SSE stream to client.
  5. Asynchronously writes version `2` to `prd_versions` after stream concludes.

---

## 7. Approval & Sign-off

*(By signing below, stakeholders agree to adhere strictly to the parameters defined within this document)*

- **Prepared By**: System Architect
- **Version**: 1.1 (Strict Enterprise)
- **Status**: MANDATORY FOR EXECUTION
