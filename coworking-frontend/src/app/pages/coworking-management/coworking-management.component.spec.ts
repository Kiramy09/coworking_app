import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingManagementComponent } from './coworking-management.component';

describe('CoworkingManagementComponent', () => {
  let component: CoworkingManagementComponent;
  let fixture: ComponentFixture<CoworkingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoworkingManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoworkingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
