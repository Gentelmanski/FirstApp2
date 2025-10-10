import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditWrapper } from './dialog-edit-wrapper';

describe('DialogEditWrapper', () => {
  let component: DialogEditWrapper;
  let fixture: ComponentFixture<DialogEditWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
