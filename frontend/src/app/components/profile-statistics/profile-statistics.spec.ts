import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileStatistics } from './profile-statistics';

describe('ProfileStatistics', () => {
  let component: ProfileStatistics;
  let fixture: ComponentFixture<ProfileStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatistics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileStatistics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
