import { Component } from '@angular/core';
import { AdminTicketsByService } from '../admin-tickets-by-service/admin-tickets-by-service';
import { AdminAgentStatusChart } from '../admin-agent-status-chart/admin-agent-status-chart';
import { AdminAgentWorkloadChart } from '../admin-agent-workload-chart/admin-agent-workload-chart';

@Component({
  selector: 'app-admin-charts-page',
  imports: [AdminTicketsByService , AdminAgentStatusChart, AdminAgentWorkloadChart],
  templateUrl: './admin-charts-page.html',
  styleUrl: './admin-charts-page.css'
})
export class AdminChartsPage {

}
