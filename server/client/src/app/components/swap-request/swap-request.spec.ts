import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwapRequest } from './swap-request';

describe('SwapRequest', () => {
  let component: SwapRequest;
  let fixture: ComponentFixture<SwapRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(SwapRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
