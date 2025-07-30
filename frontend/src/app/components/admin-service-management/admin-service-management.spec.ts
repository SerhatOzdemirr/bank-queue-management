import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServiceManagement } from './admin-service-management';

describe('AdminServiceManagement', () => {
  let component: AdminServiceManagement;
  let fixture: ComponentFixture<AdminServiceManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminServiceManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminServiceManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
