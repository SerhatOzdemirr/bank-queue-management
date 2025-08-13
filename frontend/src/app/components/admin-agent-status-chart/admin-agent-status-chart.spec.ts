import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAgentStatusChart } from './admin-agent-status-chart';

describe('AdminAgentStatusChart', () => {
  let component: AdminAgentStatusChart;
  let fixture: ComponentFixture<AdminAgentStatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAgentStatusChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAgentStatusChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
