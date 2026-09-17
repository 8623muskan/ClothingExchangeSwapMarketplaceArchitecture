import { TestBed } from '@angular/core/testing';
import { Swap } from './swap';

describe('Swap', () => {
  let service: Swap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Swap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
