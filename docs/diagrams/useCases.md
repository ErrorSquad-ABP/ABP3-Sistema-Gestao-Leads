```mermaid

flowchart LR

%% ═══════════════════════════════════════════
%% ACTORS
%% ═══════════════════════════════════════════
ATT(["👤 Attendant"])
MAN(["👤 Manager"])
GM(["👤 General Manager"])
ADM(["👤 Administrator"])
SYS(["⚙️ System"])

%% Actor generalization
MAN -->|inherits| ATT
GM -->|inherits| MAN
ADM -->|inherits| GM

%% ═══════════════════════════════════════════
%% SYSTEM
%% ═══════════════════════════════════════════
subgraph SGL["Lead Management System"]

  direction TB

  %% ────────────────────────────────────────
  %% Authentication & Profile
  %% ────────────────────────────────────────
  subgraph PKG_AUTH["Authentication & Profile"]
    direction TB
    UC_LOGIN["Authenticate User"]
    UC_UPDATE_CREDENTIALS["Update Own Credentials"]
    UC_VALIDATE_JWT[/"«include» Validate JWT Token"/]

    UC_LOGIN -.->|include| UC_VALIDATE_JWT
  end

  %% ────────────────────────────────────────
  %% Users, Teams and Stores
  %% ────────────────────────────────────────
  subgraph PKG_ORG["Users, Teams & Stores"]
    direction TB
    UC_LINK_ATTENDANT["Link Attendant to Team"]
    UC_USER_ADMIN["Manage Users (Full CRUD)"]
    UC_TEAM_ADMIN["Manage Teams (Full CRUD)"]
    UC_STORE_ADMIN["Manage Stores (Full CRUD)"]
  end

  %% ────────────────────────────────────────
  %% Customers
  %% ────────────────────────────────────────
  subgraph PKG_CUSTOMER["Customer Management"]
    direction TB
    UC_CREATE_CUSTOMER["Create Customer"]
    UC_UPDATE_CUSTOMER["Update Customer"]
    UC_CUSTOMER_ADMIN["Manage Customers (Full CRUD)"]
    UC_LINK_CUSTOMER_LEAD[/"«include» Link Customer to Lead"/]

    UC_CREATE_CUSTOMER -.-> UC_LINK_CUSTOMER_LEAD
  end

  %% ────────────────────────────────────────
  %% Leads
  %% ────────────────────────────────────────
  subgraph PKG_LEAD["Lead Management"]
    direction TB
    UC_CREATE_LEAD["Register Lead"]
    UC_REGISTER_SOURCE[/"«include» Register Lead Source"/]
    UC_ASSIGN_LEAD[/"«include» Assign Lead to Store/Attendant"/]
    UC_LIST_OWN_LEADS["List Own Leads"]
    UC_EDIT_OWN_LEAD["Edit Own Lead"]
    UC_LIST_TEAM_LEADS["List Team Leads"]
    UC_EDIT_TEAM_LEAD["Edit Team Lead"]
    UC_REASSIGN_LEAD["Reassign Lead"]
    UC_LEAD_ADMIN["Manage Leads (Full CRUD)"]

    UC_CREATE_LEAD -.-> UC_REGISTER_SOURCE
    UC_CREATE_LEAD -.-> UC_ASSIGN_LEAD
  end

  %% ────────────────────────────────────────
  %% Deals
  %% ────────────────────────────────────────
  subgraph PKG_DEAL["Deal Management"]
    direction TB
    UC_CREATE_DEAL["Create Deal"]
    UC_UPDATE_DEAL_STAGE["Update Deal Stage"]
    UC_UPDATE_DEAL_STATUS["Update Deal Status"]
    UC_CLOSE_DEAL["Close Deal"]

    UC_SET_DEAL_IMPORTANCE["Set Deal Importance"]
    UC_SET_DEAL_OPEN["Set Deal as Open"]
    UC_VALIDATE_SINGLE_ACTIVE_DEAL[/"«include» Validate Single Active Deal per Lead"/]
    UC_SET_CLOSE_REASON[/"«include» Set Close Reason"/]
    UC_DEAL_HISTORY[/"«include» Record Deal History"/]

    UC_CREATE_DEAL -.-> UC_VALIDATE_SINGLE_ACTIVE_DEAL
    UC_CREATE_DEAL -.-> UC_SET_DEAL_OPEN
    UC_CLOSE_DEAL -.-> UC_SET_CLOSE_REASON
    UC_UPDATE_DEAL_STAGE -.-> UC_DEAL_HISTORY
    UC_UPDATE_DEAL_STATUS -.-> UC_DEAL_HISTORY
    UC_CLOSE_DEAL -.-> UC_DEAL_HISTORY
  end

  %% ────────────────────────────────────────
  %% Dashboards & Analytics
  %% ────────────────────────────────────────
  subgraph PKG_DASH["Dashboards & Analytics"]
    direction TB
    UC_OPERATIONAL_DASH["View Operational Dashboard"]
    UC_TEAM_DASH["View Team Dashboard"]
    UC_GLOBAL_DASH["View Global Dashboard"]

    UC_CONVERSION_RATE[/"«include» Conversion Rate"/]
    UC_AVG_RESPONSE_TIME[/"«include» Average Time to First Response"/]
    UC_LEADS_BY_IMPORTANCE[/"«include» Leads by Importance"/]
    UC_LEADS_BY_STORE[/"«include» Leads by Store"/]
    UC_LEADS_BY_SOURCE[/"«include» Leads by Source"/]
    UC_LEADS_BY_STATUS[/"«include» Leads by Status"/]
    UC_LEADS_BY_ATTENDANT[/"«include» Leads by Attendant"/]
    UC_LEADS_BY_TEAM[/"«include» Leads by Team"/]
    UC_CLOSE_REASONS[/"«include» Close Reasons"/]
    UC_FILTER_PERIOD[/"«include» Apply Time Filter"/]
    UC_VALIDATE_PERIOD[/"«include» Validate Period Limit (1 Year Rule)"/]

    UC_FILTER_PERIOD -.-> UC_VALIDATE_PERIOD

    UC_OPERATIONAL_DASH -.-> UC_LEADS_BY_STATUS
    UC_OPERATIONAL_DASH -.-> UC_LEADS_BY_SOURCE
    UC_OPERATIONAL_DASH -.-> UC_LEADS_BY_STORE
    UC_OPERATIONAL_DASH -.-> UC_LEADS_BY_IMPORTANCE
    UC_OPERATIONAL_DASH -.-> UC_FILTER_PERIOD

    UC_TEAM_DASH -.-> UC_CONVERSION_RATE
    UC_TEAM_DASH -.-> UC_LEADS_BY_SOURCE
    UC_TEAM_DASH -.-> UC_LEADS_BY_IMPORTANCE
    UC_TEAM_DASH -.-> UC_CLOSE_REASONS
    UC_TEAM_DASH -.-> UC_LEADS_BY_STATUS
    UC_TEAM_DASH -.-> UC_LEADS_BY_ATTENDANT
    UC_TEAM_DASH -.-> UC_FILTER_PERIOD

    UC_GLOBAL_DASH -.-> UC_CONVERSION_RATE
    UC_GLOBAL_DASH -.-> UC_LEADS_BY_SOURCE
    UC_GLOBAL_DASH -.-> UC_LEADS_BY_IMPORTANCE
    UC_GLOBAL_DASH -.-> UC_CLOSE_REASONS
    UC_GLOBAL_DASH -.-> UC_LEADS_BY_TEAM
    UC_GLOBAL_DASH -.-> UC_AVG_RESPONSE_TIME
    UC_GLOBAL_DASH -.-> UC_FILTER_PERIOD
  end

  %% ────────────────────────────────────────
  %% Audit
  %% ────────────────────────────────────────
  subgraph PKG_AUDIT["Audit"]
    direction TB
    UC_VIEW_LOGS["View Audit Logs"]
    UC_REGISTER_AUDIT[/"«include» Register Audit Event"/]
  end

  %% ────────────────────────────────────────
  %% Authorization
  %% ────────────────────────────────────────
  UC_VALIDATE_RBAC[/"«include» Validate Permission (RBAC)"/]

end

%% ═══════════════════════════════════════════
%% ACTOR ASSOCIATIONS
%% ═══════════════════════════════════════════

%% Attendant
ATT --> UC_LOGIN
ATT --> UC_UPDATE_CREDENTIALS
ATT --> UC_CREATE_LEAD
ATT --> UC_LIST_OWN_LEADS
ATT --> UC_EDIT_OWN_LEAD
ATT --> UC_CREATE_CUSTOMER
ATT --> UC_UPDATE_CUSTOMER
ATT --> UC_CREATE_DEAL
ATT --> UC_UPDATE_DEAL_STAGE
ATT --> UC_UPDATE_DEAL_STATUS
ATT --> UC_CLOSE_DEAL
ATT --> UC_SET_DEAL_IMPORTANCE
ATT --> UC_OPERATIONAL_DASH

%% Manager
MAN --> UC_LIST_TEAM_LEADS
MAN --> UC_EDIT_TEAM_LEAD
MAN --> UC_REASSIGN_LEAD
MAN --> UC_TEAM_DASH
MAN --> UC_LINK_ATTENDANT

%% General Manager
GM --> UC_GLOBAL_DASH
GM --> UC_LIST_TEAM_LEADS
GM --> UC_LOGIN
GM --> UC_UPDATE_CREDENTIALS

%% Administrator
ADM --> UC_USER_ADMIN
ADM --> UC_TEAM_ADMIN
ADM --> UC_STORE_ADMIN
ADM --> UC_LEAD_ADMIN
ADM --> UC_CUSTOMER_ADMIN
ADM --> UC_VIEW_LOGS
ADM --> UC_GLOBAL_DASH

%% System
SYS --> UC_REGISTER_AUDIT

%% ═══════════════════════════════════════════
%% AUDIT ASSOCIATIONS
%% ═══════════════════════════════════════════
UC_REGISTER_AUDIT -.-> UC_LOGIN
UC_REGISTER_AUDIT -.-> UC_CREATE_LEAD
UC_REGISTER_AUDIT -.-> UC_EDIT_OWN_LEAD
UC_REGISTER_AUDIT -.-> UC_EDIT_TEAM_LEAD
UC_REGISTER_AUDIT -.-> UC_LEAD_ADMIN
UC_REGISTER_AUDIT -.-> UC_CREATE_CUSTOMER
UC_REGISTER_AUDIT -.-> UC_UPDATE_CUSTOMER
UC_REGISTER_AUDIT -.-> UC_CUSTOMER_ADMIN
UC_REGISTER_AUDIT -.-> UC_CREATE_DEAL
UC_REGISTER_AUDIT -.-> UC_UPDATE_DEAL_STAGE
UC_REGISTER_AUDIT -.-> UC_UPDATE_DEAL_STATUS
UC_REGISTER_AUDIT -.-> UC_CLOSE_DEAL
UC_REGISTER_AUDIT -.-> UC_USER_ADMIN
UC_REGISTER_AUDIT -.-> UC_TEAM_ADMIN

%% ═══════════════════════════════════════════
%% RBAC ASSOCIATIONS
%% ═══════════════════════════════════════════
UC_CREATE_LEAD -.-> UC_VALIDATE_RBAC
UC_EDIT_OWN_LEAD -.-> UC_VALIDATE_RBAC
UC_EDIT_TEAM_LEAD -.-> UC_VALIDATE_RBAC
UC_CREATE_CUSTOMER -.-> UC_VALIDATE_RBAC
UC_UPDATE_CUSTOMER -.-> UC_VALIDATE_RBAC
UC_CREATE_DEAL -.-> UC_VALIDATE_RBAC
UC_UPDATE_DEAL_STAGE -.-> UC_VALIDATE_RBAC
UC_UPDATE_DEAL_STATUS -.-> UC_VALIDATE_RBAC
UC_CLOSE_DEAL -.-> UC_VALIDATE_RBAC
UC_USER_ADMIN -.-> UC_VALIDATE_RBAC
UC_TEAM_ADMIN -.-> UC_VALIDATE_RBAC
UC_STORE_ADMIN -.-> UC_VALIDATE_RBAC
UC_LEAD_ADMIN -.-> UC_VALIDATE_RBAC
UC_CUSTOMER_ADMIN -.-> UC_VALIDATE_RBAC
UC_VIEW_LOGS -.-> UC_VALIDATE_RBAC
UC_TEAM_DASH -.-> UC_VALIDATE_RBAC
UC_GLOBAL_DASH -.-> UC_VALIDATE_RBAC
