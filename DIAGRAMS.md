# Recruitment System Thesis Diagrams

This document contains the Mermaid diagrams detailing the workflows, processes, use cases, and architecture of the Faculty Recruitment System. These diagrams can be rendered in any Markdown viewer supporting Mermaid (such as GitHub, VS Code with Mermaid extensions, or Mermaid Live Editor).

---

## 1. End-to-End Recruitment Process Flowchart

This flowchart outlines the complete lifecycle of a recruitment campaign, starting from the admin publishing a vacancy to the candidate applying, undergoing automated assessment with online proctoring, assessor evaluation, committee peer review, and the final hiring decision.

```mermaid
flowchart TD
    %% Define Styles
    classDef admin fill:#f9f,stroke:#333,stroke-width:2px;
    classDef cand fill:#bbf,stroke:#333,stroke-width:2px;
    classDef assess fill:#f96,stroke:#333,stroke-width:2px;
    classDef comm fill:#bfb,stroke:#333,stroke-width:2px;
    classDef sys fill:#eee,stroke:#333,stroke-width:1px;

    Start([Start Recruitment Process]) --> A1[Admin: Create & Publish Position]:::admin
    A1 --> C1[Candidate: Browse Positions & Register]:::cand
    C1 --> C2[Candidate: Submit Multi-step Application & Docs]:::cand
    C2 --> S1{Initial Screening Passed?}:::sys
    
    S1 -- No --> S2[Reject Candidate / Send Notification]:::sys
    S1 -- Yes --> As1[Assessor: Select Template & Send Invitation]:::assess
    
    As1 --> C3[Candidate: Start Online Timed Assessment]:::cand
    C3 --> C4[System: Monitor Proctoring Events & Record Code]:::sys
    C4 --> C5[Candidate: Submit Assessment]:::cand
    
    C5 --> As2[Assessor: Grade & Review Submission]:::assess
    As2 --> S3{Score >= Passing Threshold?}:::sys
    
    S3 -- No --> S2
    S3 -- Yes --> Co1[Committee: Review Docs & Assessment Score]:::comm
    
    Co1 --> Co2[Committee: Evaluate Candidate via Standard Rubric]:::comm
    Co2 --> Co3[Committee: Perform Peer Review Consensus]:::comm
    Co3 --> Co4{Hiring Decision?}:::comm
    
    Co4 -- Reject --> S2
    Co4 -- Waitlist --> Co5[Add to Waitlist]:::comm
    Co4 -- Hire/Offer --> A2[Admin: Extend Formal Offer]:::admin
    
    S2 --> End([End Process])
    Co5 --> End
    A2 --> End
```

---

## 2. Data Flow Diagrams (DFD)

The Data Flow Diagrams represent how information flows through the system, mapping external inputs to process flows, database changes, and external third-party integrations.

### Level 0: System Context Diagram

The Context Diagram shows the primary entities interacting with the boundaries of the Recruitment System.

```mermaid
flowchart TD
    Cand[Candidate] -->|Submit App / Answers| FRS((Faculty Recruitment System))
    FRS -->|Notifications / Status Updates| Cand
    
    Assess[Assessor] -->|Create Templates / Score Submissions| FRS
    FRS -->|Assessments Pending Review| Assess
    
    Comm[Committee Member] -->|Submit Reviews & Rubric Votes| FRS
    FRS -->|Application Dossiers| Comm
    
    Admin[Administrator] -->|Manage Users & Positions| FRS
    FRS -->|Audit Logs / Analytics Reports| Admin
    
    FRS <-->|Sandboxed Code Executions| J0[Judge0 API]
    FRS -->|SMTP Mail Dispatch| Email[Email Server / SMTP]
```

### Level 1: System Processes & Data Stores Diagram

The Level 1 DFD decomposes the system boundaries into core processes (matching the application controller logic) and data stores (matching the MongoDB collections).

```mermaid
flowchart TB
    %% External Entities
    subgraph Users [System Users]
        Cand([Candidate])
        Assess([Assessor])
        Comm([Committee Member])
        Admin([Administrator])
    end

    %% Processes
    subgraph Processes [Application Core Processes]
        P1((1.0 Auth & Profile Mgmt))
        P2((2.0 Position & Application Mgmt))
        P3((3.0 Assessment & Proctoring))
        P4((4.0 Committee Review & Decisions))
        P5((5.0 System Auditing & Reporting))
    end

    %% Data Stores
    subgraph DataStores [Database - MongoDB]
        DS1[(DS1: Users & Profiles)]
        DS2[(DS2: Positions & Applications)]
        DS3[(DS3: Assessments, Templates & Results)]
        DS4[(DS4: Peer Reviews & Hiring Decisions)]
        DS5[(DS5: Audit Logs & System Settings)]
    end

    %% External Services
    subgraph ExtServices [External APIs]
        Judge0[Judge0 Compiler API]
        SMTP[SMTP Email Server]
    end

    %% DFD Level 1 Flow Connections
    %% Process 1 (Authentication)
    Cand & Assess & Comm & Admin -->|Credentials| P1
    P1 <-->|Read/Write User Data| DS1
    P1 -->|Account Status| Users

    %% Process 2 (Job/App Management)
    Admin -->|Manage Positions| P2
    Cand -->|Browse Positions & Apply| P2
    P2 <-->|Read/Write Jobs & Apps| DS2
    P2 -->|Job Alert / Confirmation| SMTP

    %% Process 3 (Assessment & Proctoring)
    Assess -->|Create Templates & Invite| P3
    Cand -->|Submit Solutions & Proctor Logs| P3
    P3 <-->|Read/Write Assessments & Results| DS3
    P3 <-->|Execute Sandboxed Code| Judge0
    P3 -->|Evaluation Ready Notification| SMTP

    %% Process 4 (Committee Actions)
    Comm -->|Evaluate & Vote| P4
    P4 <-->|Read/Write Rubrics, Reviews & Hiring Decisions| DS4
    P4 -->|Update Status| DS2
    P4 -->|Decision Notification| SMTP

    %% Process 5 (Auditing)
    Admin -->|Configure Settings & View Reports| P5
    P5 <-->|Read System Config & Audit Events| DS5
    P2 & P3 & P4 -->|Log User Actions| DS5
```

---

## 3. Use Case Diagram

This use case diagram models the interactions of each user role (Actor) with the sub-components and dashboards of the Next.js recruitment app.

```mermaid
graph TD
    %% Use Case Diagram styling & layout
    classDef actor fill:#def,stroke:#333,stroke-width:2px;
    classDef uc fill:#fff,stroke:#333,stroke-width:1px;

    %% Actors
    Cand[Candidate]:::actor
    Assess[Assessor]:::actor
    Comm[Committee Member]:::actor
    Admin[Administrator]:::actor

    %% Use Cases
    subgraph Candidate_UC [Candidate Use Cases]
        UC_Browse(["Browse & Search Positions"]):::uc
        UC_Apply(["Submit Job Application"]):::uc
        UC_TakeTest(["Complete Timed Assessment"]):::uc
        UC_Proctor(["Proctor Session Interaction"]):::uc
        UC_ViewStatus(["Track Application Status"]):::uc
    end

    subgraph Assessor_UC [Assessor Use Cases]
        UC_Temp(["Manage Assessment Templates"]):::uc
        UC_Invite(["Manage Assessment Invitations"]):::uc
        UC_Grade(["Score Candidate Assessments"]):::uc
        UC_ViewAn(["View Assessment Analytics"]):::uc
    end

    subgraph Committee_UC [Committee Use Cases]
        UC_RevApp(["Review Application & Docs"]):::uc
        UC_Rubric(["Evaluate Candidate Rubric"]):::uc
        UC_Consensus(["Submit Committee Decision"]):::uc
    end

    subgraph Admin_UC [Admin Use Cases]
        UC_Users(["Manage System Users & Roles"]):::uc
        UC_Pos(["Manage Positions"]):::uc
        UC_Logs(["Review System Audit Logs"]):::uc
        UC_Config(["Configure SMTP/Judge0 API"]):::uc
    end

    %% Auth & Core Use Case (shared)
    UC_Login(["Authenticate (Register / Login)"]):::uc

    %% Associations
    Cand --> UC_Login
    Cand --> UC_Browse
    Cand --> UC_Apply
    Cand --> UC_TakeTest
    Cand --> UC_ViewStatus
    
    Assess --> UC_Login
    Assess --> UC_Temp
    Assess --> UC_Invite
    Assess --> UC_Grade
    Assess --> UC_ViewAn

    Comm --> UC_Login
    Comm --> UC_RevApp
    Comm --> UC_Rubric
    Comm --> UC_Consensus

    Admin --> UC_Login
    Admin --> UC_Users
    Admin --> UC_Pos
    Admin --> UC_Logs
    Admin --> UC_Config

    %% Include / Extend relationships
    UC_Apply -.->|"<<include>>"| UC_Login
    UC_TakeTest -.->|"<<include>>"| UC_Login
    UC_TakeTest -.->|"<<include>>"| UC_Proctor
    UC_RevApp -.->|"<<include>>"| UC_Login
    UC_Consensus -.->|"<<include>>"| UC_Login
    UC_Grade -.->|"<<include>>"| UC_Login
```

---

## 4. System Architecture Diagram

This diagram displays the high-level components of the web application, showing a modularized multi-tier layout starting from the Nginx proxy, Next.js middleware protection, down to the controller layer, local filesystems, external API execution, and NoSQL databases.

```mermaid
flowchart TB
    %% Presentation Layer
    subgraph Presentation [Presentation Layer - Next.js React Frontend]
        direction LR
        UI_Cand[Candidate Dashboard]
        UI_Ass[Assessor Dashboard]
        UI_Com[Committee Dashboard]
        UI_Adm[Admin Dashboard]
    end

    %% Security Layer
    subgraph Security [Security & Middleware]
        direction TB
        Auth_Mid[NextAuth.js Session Validation]
        Rate_Lim[Rate Limiting Middleware]
    end

    %% Server Logic Layer
    subgraph Logic [Application Logic Layer - Next.js App Router & API Endpoints]
        direction TB
        Ctrl_Auth[Authentication Handler]
        Ctrl_Pos[Position & Application Manager]
        Ctrl_Ass[Assessment & Proctoring Handler]
        Ctrl_Rev[Peer Review & Decision Manager]
        Ctrl_Notif[Notification & Logging Service]
    end

    %% External Integration Layer
    subgraph External [External Integrations]
        direction LR
        J0_Api[Judge0 Compilation API]
        SMTP[SMTP Email Server]
        Local_FS[Local Filesystem Storage]
    end

    %% Persistence Layer
    subgraph Persistence [Data Persistence Layer]
        Mongoose[Mongoose ODM]
        MongoDB[(MongoDB Database)]
    end

    %% Infrastructure Layer
    subgraph Infra [Infrastructure & Deployment Layer]
        Nginx[Nginx Reverse Proxy]
        Docker[Docker Standalone Container]
    end

    %% Layer Connections
    Presentation -->|HTTPS Requests| Nginx
    Nginx --> Docker
    Docker --> Security
    Security --> Logic
    
    %% Internal flows in Logic Layer to Database
    Logic --> Mongoose
    Mongoose --> MongoDB

    %% Logic Layer to External Services
    Ctrl_Ass <-->|HTTP POST - Sandboxed Exec| J0_Api
    Ctrl_Notif -->|SMTP Transport| SMTP
    Ctrl_Pos -->|Write Resume/Cover Letter PDFs| Local_FS
```
