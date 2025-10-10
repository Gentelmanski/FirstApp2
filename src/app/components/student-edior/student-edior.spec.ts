import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEdior } from './student-edior';

describe('StudentEdior', () => {
  let component: StudentEdior;
  let fixture: ComponentFixture<StudentEdior>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEdior]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEdior);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
