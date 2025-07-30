import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Bu satırı ekledik
import { AdminService, Ticket } from '../../services/admin.service';
import { ServiceItem } from '../../services/service-item';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.html',
  styleUrl: './admin-tickets.css',
  standalone: true, // <-- Eğer bileşeniniz standalone ise bu satır olmalı
  imports: [CommonModule] // <-- Bu satırı ekledik
})
export class AdminTickets implements OnInit {
  services: ServiceItem[] = [];
  tickets: Ticket[] = [];
  selectedKey = '';
  loading = false;
  canceling: { [key: string]: boolean } = {};

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadTickets();
  }

  loadServices(): void {
    this.admin.getServices().subscribe(list => this.services = list);
  }

  loadTickets(): void {
    this.loading = true;
    this.admin.getTickets(this.selectedKey)
      .subscribe(list => {
        this.tickets = list;
        this.loading = false;
      }, _ => this.loading = false);
  }

  onServiceChange(key: string): void {
    this.selectedKey = key;
    this.loadTickets();
  }

  cancel(ticket: Ticket): void {
    const id = `${ticket.serviceKey}_${ticket.number}`;
    this.canceling[id] = true;
    this.admin.cancelTicket(ticket.serviceKey, ticket.number)
      .subscribe(() => {
        this.tickets = this.tickets.filter(
          t => !(t.serviceKey === ticket.serviceKey && t.number === ticket.number)
        );
        delete this.canceling[id];
      }, _ => {
        delete this.canceling[id];
      });
  }
}
