import { Component } from '@angular/core';
import { GeoReference } from '../helmert-lava-current';
import { scaleAndRotate, square } from "../utils";
import { georeference } from '../transformation-matrix-affine';

@Component({
  selector: 'app-georeference-container',
  templateUrl: './georeference-container.component.html',
  styleUrls: ['./georeference-container.component.css']
})
export class GeoreferenceContainerComponent {

  sourceControlPoints: any[] = [];
  targetControlPoints: any[] = [];
  transformation: GeoReference = new GeoReference();

  tests: GeoReferenceTest[] = [];
  constructor() {
    this.generateTests();
  }
  generateTests() {
    const source = square;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const inputScaleFactor = [i + 1, i + 1];
        const inputTranslateFactor = [i, i]
        const angle = 1;
        const target = scaleAndRotate(source, inputScaleFactor, inputTranslateFactor,angle);
        const geoReference = new GeoReference();
        const sourceControlPoints = source.slice(0, 3);
        const targetControlPoints = target.slice(0, 3);
        geoReference.setControlPoints(sourceControlPoints, targetControlPoints);
        const resultScaleFactor = geoReference.getScale();
        const resultTranslateFactor = geoReference.getTranslation();
        const sforresult2 = sourceControlPoints.map(coord => ({ x: coord[0], y: coord[1] }));
        const tforresult2 = targetControlPoints.map(coord => ({ x: coord[0], y: coord[1] }));
        const result2 = georeference(sforresult2, tforresult2);
        this.tests.push({
          source: sourceControlPoints,
          target: targetControlPoints,
          input: [inputScaleFactor, inputTranslateFactor, angle],
          output: [resultScaleFactor, resultTranslateFactor, geoReference.getRotation()],
          output2: [result2.scale,result2.translation,result2.rotate]
        });
      }
    }

  }
}
type GeoReferenceTest = {
  source: number[][];
  target: number[][];
  input: any;
  output: any;
  output2: any;
}