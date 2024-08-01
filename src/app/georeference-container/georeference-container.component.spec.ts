import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoreferenceContainerComponent } from './georeference-container.component';

describe('GeoreferenceContainerComponent', () => {
  let component: GeoreferenceContainerComponent;
  let fixture: ComponentFixture<GeoreferenceContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoreferenceContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoreferenceContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
