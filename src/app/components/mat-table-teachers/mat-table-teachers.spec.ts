import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTableTeachers } from './mat-table-teachers';

describe('MatTableTeachers', () => {
  let component: MatTableTeachers;
  let fixture: ComponentFixture<MatTableTeachers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableTeachers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatTableTeachers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
