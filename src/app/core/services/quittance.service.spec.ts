import { TestBed } from '@angular/core/testing';

import { QuittanceService } from './quittance.service';

describe('QuittanceService', () => {
  let service: QuittanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuittanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
