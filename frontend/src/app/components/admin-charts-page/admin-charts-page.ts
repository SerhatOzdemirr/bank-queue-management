import { Component } from '@angular/core';
import { AdminTicketsByService } from '../admin-tickets-by-service/admin-tickets-by-service';

@Component({
  selector: 'app-admin-charts-page',
  imports: [AdminTicketsByService],
  templateUrl: './admin-charts-page.html',
  styleUrl: './admin-charts-page.css'
})
export class AdminChartsPage {

}
