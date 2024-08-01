import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-coordinates',
  templateUrl: './coordinates.component.html',
  styleUrls: ['./coordinates.component.css']
})
export class CoordinatesComponent {
  coordinatesForm: FormGroup;

  @Output() coordinatesChange = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {

    this.coordinatesForm = this.formBuilder.group({
      topLeft: this.formBuilder.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required]
      }),
      topRight: this.formBuilder.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required]
      }),
      bottomLeft: this.formBuilder.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required]
      }),
      bottomRight: this.formBuilder.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required]
      })
    });
    this.coordinatesForm.valueChanges.pipe(debounceTime(100)).subscribe(res=>{ 
      const controlPoints = [
        [+res.topLeft.latitude,+res.topLeft.longitude],
        [+res.topRight.latitude,+res.topRight.longitude],
        [+res.bottomLeft.latitude,+res.bottomLeft.longitude],
        [+res.bottomRight.latitude,+res.bottomRight.longitude],
      ];
      this.coordinatesChange.emit(controlPoints);
    });
  }
}
