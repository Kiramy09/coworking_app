import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingSpacesComponent } from './coworking-spaces.component';

describe('CoworkingSpacesComponent', () => {
  let component: CoworkingSpacesComponent;
  let fixture: ComponentFixture<CoworkingSpacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoworkingSpacesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoworkingSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
