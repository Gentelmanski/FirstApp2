import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTableGroups } from './mat-table-groups';

describe('MatTableGroups', () => {
  let component: MatTableGroups;
  let fixture: ComponentFixture<MatTableGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableGroups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatTableGroups);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
