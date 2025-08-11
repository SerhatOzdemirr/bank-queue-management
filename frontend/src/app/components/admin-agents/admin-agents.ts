import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  AdminAgentsService,
  AgentWithSkillsDto,
  CreateAgentWithSkillsDto,
} from "../../services/admin-agents.service";
import { ServicesService } from "../../services/bank.services";
import { ServiceItem } from "../../services/service-item";
import { BootstrapStyleService } from "../../services/bootstrap-styles.service";
@Component({
  standalone: true,
  selector: "app-admin-agents",
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-agents.html",
  styleUrls: ["./admin-agents.css"],
})
export class AdminAgents implements OnInit, OnDestroy {
  // form fields
  username = "";
  email = "";
  password = "";
  selectedKeys: string[] = [];

  // data lists
  services: ServiceItem[] = [];
  agents: AgentWithSkillsDto[] = [];

  error = "";
  success = "";

  private adminSvc = inject(AdminAgentsService);
  private servicesSvc = inject(ServicesService);
  private bootstrapstyleservice = inject(BootstrapStyleService);
  ngOnInit() {
    this.loadServices();
    this.loadAgents();
    this.bootstrapstyleservice.enable();
  }
  ngOnDestroy(): void {
    this.bootstrapstyleservice.disable();
  }

  loadServices() {
    this.servicesSvc.getAll().subscribe({
      next: (list) => (this.services = list),
      error: () => (this.error = "Services yüklenemedi."),
    });
  }

  loadAgents() {
    this.adminSvc.getAgents().subscribe({
      next: (list) => (this.agents = list),
      error: () => (this.error = "Agents yüklenemedi."),
    });
  }

  onServiceToggle(key: string, checked: boolean) {
    if (checked) {
      this.selectedKeys.push(key);
    } else {
      this.selectedKeys = this.selectedKeys.filter((k) => k !== key);
    }
  }

  createAgent() {
    this.error = "";
    this.success = "";

    if (!this.username || !this.email || !this.password) {
      this.error = "All fields are required.";
      return;
    }

    const dto: CreateAgentWithSkillsDto = {
      username: this.username.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      serviceKeys: [...new Set(this.selectedKeys)],
    };

    this.adminSvc.createAgent(dto).subscribe({
      next: () => {
        this.success = "Agent created.";
        this.username = this.email = this.password = "";
        this.selectedKeys = [];
        this.loadAgents();
      },
      error: (err) => (this.error = err.error || "Agent creation failed."),
    });
  }
}
