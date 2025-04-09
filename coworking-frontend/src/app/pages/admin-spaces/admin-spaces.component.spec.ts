import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpacesComponent } from './admin-spaces.component';

describe('AdminSpacesComponent', () => {
  let component: AdminSpacesComponent;
  let fixture: ComponentFixture<AdminSpacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpacesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
