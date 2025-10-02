BankNumerator — Bank Queue Management System
============================================

> A full-stack, role-based queue management app for bank branches.**Frontend:** Angular 20 + Chart.js • **Backend:** ASP.NET Core 9 Web API • **DB:** PostgreSQL

Contents
--------

*   [Overview](#overview)
    
*   [Key Features](#key-features)
    
*   [Architecture](#architecture)
    
*   [Tech Stack](#tech-stack)
    
*   [Directory Structure](#directory-structure)
    
*   [Getting Started](#getting-started)
    
    *   [Backend Setup](#backend-setup)
        
    *   [Frontend Setup](#frontend-setup)
        
*   [Configuration](#configuration)
    
*   [API Overview](#api-overview)
    
*   [Roles & Workflows](#roles--workflows)
    
*   [Analytics](#analytics)
    
*   [Testing](#testing)
    
*   [Deployment](#deployment)
    
*   [Contributing](#contributing)
    
*   [License](#license)
    
*   [Acknowledgements](#acknowledgements)
    

Overview
--------

**BankNumerator** allows customers to take and cancel numbered tickets for banking services. **Agents** process tickets according to their skills. **Administrators** manage services, agents, users, and monitor real-time analytics.

*   Secure **JWT authentication** with **hashed passwords**
    
*   Priority-aware queuing (service & user priority + waiting time aging)
    
*   Agent skills & routing
    
*   Admin dashboards with **Chart.js**
    

Key Features
------------

*   **Role-based model**
    
    *   Roles: Default User, Admin, Agent
        
    *   Passwords stored as salted hashes; JWT-based auth
        
*   **Ticket issuing & cancellation**
    
    *   Per-service daily limits, counter increments/decrements
        
    *   Persisted tickets with service label, user, timestamps
        
*   **Dynamic priority queue**
    
    *   Ordering by **service priority**, **user priority**, and **wait time aging**
        
*   **Admin controls**
    
    *   Create/update/deactivate/limit services
        
    *   View/cancel any ticket; list users and set **PriorityScore (1–5)**
        
*   **Agent operations**
    
    *   View own pending tickets by effective priority
        
    *   **Accept / Reject / Release / Route** (routing requires destination agent skill)
        
*   **Analytics dashboard**
    
    *   Ticket counts per service
        
    *   Agent activity (pending/accepted/rejected totals)
        
*   **Agent & skill management**
    
    *   Create agents, assign skills, enforce unique email/username
        
    *   Transactional creation for consistency
        
*   **Clean REST API**
    
    *   Auth, Services, Numerator (tickets), Admin, Admin/Agents, Agent/Tickets
        

Architecture
------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Angular 20 SPA (Auth/Guards, Services, Components)     Chart.js                   │                          ▲                   │ HTTP (JWT)               │ Charts Data                   ▼                          │          ASP.NET Core 9 Web API (Controllers + Domain Services)                   │                   ▼               PostgreSQL (EF Core ORM)   `

**Tiers**

*   **Client:** Angular 20 SPA (Login, Signup, Numerator, Admin Dashboard/Service/Agents/Tickets, Agent Tickets)
    
*   **Server:** ASP.NET Core 9 Web API (JWT, DI, Swagger, PostgreSQL)
    
*   **Data:** PostgreSQL tables: Users, Agents, AgentSkills, ServiceItems, ServiceCounters, Tickets, TicketAssignments
    

Tech Stack
----------

*   **Frontend:** Angular 20, RxJS, Chart.js
    
*   **Backend:** .NET 9 (ASP.NET Core Web API), EF Core (Npgsql)
    
*   **Database:** PostgreSQL
    
*   **Testing:** Karma/Jasmine (unit), Playwright (E2E)
    

Directory Structure
-------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bank-queue-management/  ├─ backend/  │  └─ BankNumerator.Api/            # ASP.NET Core 9 Web API  │     ├─ Controllers/               # Auth, Services, Numerator, Admin, AgentTickets, AdminAgents  │     ├─ Services/                  # AuthService, NumeratorService, AdminService, AgentTicketsService, ...  │     ├─ Models/                    # User, Agent, ServiceItem, Ticket, AgentSkill, TicketAssignment, ...  │     └─ Data/                      # BankNumeratorContext (DbContext)  ├─ frontend/  │  ├─ src/                          # Angular app (components, services, guards, interceptor)  │  ├─ package.json                  # Angular 20 + Chart.js + Playwright deps  │  └─ playwright.config.ts  └─ BankNumerator_Sofware_Design_Document.pdf   `

Getting Started
---------------

### Prerequisites

*   **Backend:** .NET SDK 9, PostgreSQL server
    
*   **Frontend:** Node.js ≥ 18, npm, Angular CLI v20 (npm i -g @angular/cli)
    

### Clone

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone https://github.com/SerhatOzdemirr/bank-queue-management.git  cd bank-queue-management   `

### Backend Setup

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd backend/BankNumerator.Api  dotnet restore   `

Configure **connection string** and **JWT** (see [Configuration](#configuration)).Apply migrations (add if missing) and update DB:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   dotnet ef migrations add InitialCreate  dotnet ef database update   `

Run API:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   dotnet run   `

> API will listen on your configured port (e.g., https://localhost:5001). Swagger is enabled in Development.

### Frontend Setup

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd ../../frontend  npm install   `

Set the API base URL in src/environments/environment.ts (e.g., http://localhost:5000/api).

Run dev server:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ng serve   `

> App runs at http://localhost:4200/.

Configuration
-------------

### Backend (appsettings.json or environment variables)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "ConnectionStrings": {      "DefaultConnection": "Host=localhost;Port=5432;Database=banknumerator;Username=postgres;Password=yourpassword"    },    "JwtSettings": {      "Key": "your-very-strong-secret",      "Issuer": "BankNumerator",      "Audience": "BankNumeratorClients",      "DurationInMinutes": 60    }  }   `

### Frontend (src/environments/environment.ts)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   export const environment = {    production: false,    apiBaseUrl: 'http://localhost:5000/api'  };   `

API Overview
------------

### Auth (/api/auth)

*   POST /signup – Register default user
    
*   POST /login – Authenticate and receive JWT
    
*   POST /signup-admin – Register admin (requires Admin role)
    

### Services (/api/services)

*   GET / – List active services (anonymous)
    

### Numerator (/api/numerator) — _Authenticated_

*   GET /next?service={serviceKey} – Issue next ticket for a service
    
*   DELETE /{ticketId} – Cancel user’s ticket
    

### Admin (/api/admin) — _Admin only_

*   **Services:** create/update/deactivate/limit; list with counters
    
*   **Tickets:** list all (filter by service), cancel by composite
    
*   **Users:** list all, update **PriorityScore (1–5)**
    

### Admin Agents (/api/admin/agents) — _Admin only_

*   GET / – List agents with skills
    
*   POST / – Create agent (unique email/username) + skills (transactional)
    
*   DELETE /{id} – Remove agent
    

### Agent Tickets (/api/agent/tickets) — _Agent only_

*   GET / – Pending tickets ordered by effective priority
    
*   POST /accept / POST /reject / POST /release
    
*   POST /route – Route to another skilled agent
    
*   GET /route-candidates/{serviceKey} – Eligible agents for a service
    

Roles & Workflows
-----------------

### Default Users

*   Sign up / log in
    
*   View active services
    
*   Take a ticket (if service active and within daily limit)
    
*   See ticket number, service, assigned agent
    
*   Cancel own ticket
    

### Administrators

*   **Manage Services:** key, label, active, max number, priority (1–5)
    
*   **Manage Users:** set **PriorityScore**
    
*   **Manage Agents:** create agents with skills, enforce unique identifiers
    
*   **Review/Cancel Tickets:** list, filter, cancel
    
*   **Monitor Analytics:** service counts & agent activity
    

### Agents

*   See own pending tickets ordered by **service priority + user priority + wait aging**
    
*   **Accept / Reject / Release** tickets
    
*   **Route** tickets to qualified agents (must have skill)
    

Analytics
---------

*   **Service ticket counts:** totals per service for ranges (today / 7d / 30d)
    
*   **Agent activity:** pending / accepted / rejected totals + recent tickets listBacked by dedicated aggregation services used by the Admin dashboard’s Chart.js widgets.
    

Testing
-------

### Frontend

*   npx playwright test
    

> Backend tests are not included yet; consider adding xUnit projects for services & controllers.

Deployment
----------

### Frontend (Angular)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ng build --configuration production   `

Serve files from dist/ behind a web server / reverse proxy.

### Backend (ASP.NET Core)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   dotnet publish -c Release   `

Deploy published output to your hosting environment (Linux service, IIS, container, etc.). Configure environment variables for connection string and JWT in production.

Contributing
------------

1.  Fork the repo and create a feature branch.
    
2.  Make changes with clear, conventional commit messages.
    
3.  Ensure backend builds and frontend tests pass.
    
4.  Open a pull request describing your change set.
    

Bug reports & feature requests are welcome via **Issues**.

License
-------

No license file is present. For production use or adaptation, please contact the maintainer or add a suitable open-source license (e.g., MIT).

Acknowledgements
----------------

Developed by **Serhat Özdemir**.See the included **Software Design Document** for detailed architecture, data design, and UI flows; this README summarizes and streamlines those details.
