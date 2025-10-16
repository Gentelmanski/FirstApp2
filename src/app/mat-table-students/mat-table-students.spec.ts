import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTableStudents } from './mat-table-students';

describe('MatTableStudents', () => {
  let component: MatTableStudents;
  let fixture: ComponentFixture<MatTableStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatTableStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
