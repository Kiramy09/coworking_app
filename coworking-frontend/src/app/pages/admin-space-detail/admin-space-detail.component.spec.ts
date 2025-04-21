import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpaceDetailComponent } from './admin-space-detail.component';

describe('AdminSpaceDetailComponent', () => {
  let component: AdminSpaceDetailComponent;
  let fixture: ComponentFixture<AdminSpaceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpaceDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSpaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
