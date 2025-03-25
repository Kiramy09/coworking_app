import { TestBed } from '@angular/core/testing';

import { CoworkingService } from './coworking.service';

describe('CoworkingService', () => {
  let service: CoworkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoworkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
