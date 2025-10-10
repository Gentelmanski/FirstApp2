import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableStudents } from './table-students';

describe('TableStudents', () => {
  let component: TableStudents;
  let fixture: ComponentFixture<TableStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableStudents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
