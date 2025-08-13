import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAgentWorkloadChart } from './admin-agent-workload-chart';

describe('AdminAgentWorkloadChart', () => {
  let component: AdminAgentWorkloadChart;
  let fixture: ComponentFixture<AdminAgentWorkloadChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAgentWorkloadChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAgentWorkloadChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
