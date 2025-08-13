import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChartsPage } from './admin-charts-page';

describe('AdminChartsPage', () => {
  let component: AdminChartsPage;
  let fixture: ComponentFixture<AdminChartsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminChartsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminChartsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
