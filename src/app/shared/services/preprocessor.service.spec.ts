import { TestBed } from '@angular/core/testing';

import { PreprocessorService } from './preprocessor.service';

describe('PreprocessorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreprocessorService = TestBed.get(PreprocessorService);
    expect(service).toBeTruthy();
  });
});
