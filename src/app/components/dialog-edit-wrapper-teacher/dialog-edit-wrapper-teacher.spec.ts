import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditWrapperTeacher } from './dialog-edit-wrapper-teacher';

describe('DialogEditWrapperTeacher', () => {
  let component: DialogEditWrapperTeacher;
  let fixture: ComponentFixture<DialogEditWrapperTeacher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditWrapperTeacher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditWrapperTeacher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
