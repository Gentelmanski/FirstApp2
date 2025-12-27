import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAssingGroups } from './dialog-assing-groups';

describe('DialogAssingGroups', () => {
  let component: DialogAssingGroups;
  let fixture: ComponentFixture<DialogAssingGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAssingGroups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAssingGroups);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
