import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditWrapperGroup } from './dialog-edit-wrapper-group';

describe('DialogEditWrapperGroup', () => {
  let component: DialogEditWrapperGroup;
  let fixture: ComponentFixture<DialogEditWrapperGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditWrapperGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditWrapperGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
