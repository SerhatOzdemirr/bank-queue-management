import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTicketsByService } from './admin-tickets-by-service';

describe('AdminTicketsByService', () => {
  let component: AdminTicketsByService;
  let fixture: ComponentFixture<AdminTicketsByService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketsByService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTicketsByService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
