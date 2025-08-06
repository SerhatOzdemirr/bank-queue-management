// src/app/app.routes.ts
import { Routes } from "@angular/router";
import { authGuard, authMatchGuard } from "./guards/auth.guard";
import { adminGuard } from "./guards/admin.guard";
// ← Agent guard’ını import et
import { agentGuard } from "./guards/agent.guard";

export const routes: Routes = [
  { path: "", redirectTo: "signup", pathMatch: "full" },
  {
    path: "signup",
    loadComponent: () =>
      import("./components/signup/signup").then((m) => m.Signup),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/login/login").then((m) => m.Login),
  },
  {
    path: "numerator",
    canActivate: [authGuard],
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import("./components/numerator/numerator").then((m) => m.Numerator),
  },

  // ————— Admin routes —————
  {
    path: "admin",
    canActivate: [authGuard, adminGuard],
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import("./components/admin-dashboard/admin-dashboard").then(
        (m) => m.AdminDashboard
      ),
    children: [
      {
        path: "services",
        loadComponent: () =>
          import(
            "./components/admin-service-management/admin-service-management"
          ).then((m) => m.ServiceManagementComponent),
      },
      {
        path: "tickets",
        loadComponent: () =>
          import("./components/admin-tickets/admin-tickets").then(
            (m) => m.AdminTickets
          ),
      },
      {
        path: "create",
        loadComponent: () =>
          import("./components/admin-signup/admin-signup").then(
            (m) => m.AdminSignup
          ),
        data: { hideSidebar: true },
      },
      {
        path: "agents",
        loadComponent: () =>
          import("./components/admin-agents/admin-agents").then(
            (m) => m.AdminAgents
          ),
        data: { hideSidebar: true },
      },
    ],
  },

  // ————— Agent routes —————
  {
    path: "agent/tickets",
    canActivate: [authGuard, agentGuard],
    canMatch: [authMatchGuard],
    loadComponent: () =>
      import("./components/agent-tickets/agent-tickets").then(
        (m) => m.AgentTickets
      ),
  },

  { path: "**", redirectTo: "signup" },
];
