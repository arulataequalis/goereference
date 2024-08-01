export class GeoReference {

    matrix: any = [1, 0, 0, 0, 1, 0];
    private _rotation: number = 0;
    private _scale: any;
    private _translation: any;

    setControlPoints = (sourcePoints: any, targetPoints: any) => {
        this.geoReference(sourcePoints, targetPoints);
    };

    getRotation = () => {
        return +this._rotation.toFixed(3);
    };

    getScale = () => {
        return [+this._scale[0].toFixed(2),+this._scale[1].toFixed(2)];
    };
    getTranslation = () => {
        return [+this._translation[0].toFixed(2),+this._translation[1].toFixed(2)];
    };

    private get scaleX() {
        return this.matrix[0];
    }
    private set scaleX(value) {
        this.matrix[0] = value;
    }

    private get scaleY() {
        return this.matrix[4];
    }
    private set scaleY(value) {
        this.matrix[4] = value;
    }

    private get rotationX() {
        return this.matrix[3];
    }
    private set rotationX(value) {
        this.matrix[3] = value;
    }

    private get rotationY() {
        return this.matrix[1];
    }
    private set rotationY(value) {
        this.matrix[1] = value;
    }

    private get translationX() {
        return this.matrix[2];
    }
    private set translationX(value) {
        this.matrix[2] = value;
    }

    private get translationY() {
        return this.matrix[5];
    }
    private set translationY(value) {
        this.matrix[5] = value;
    }

    transform = (coordinate: any) => {
        const x = coordinate[0];
        const y = coordinate[1];

        return [
            (this.scaleX * x + this.rotationY * y + this.translationX),
            (this.rotationX * x + this.scaleY * y + this.translationY)
        ];
    };

    reverseTransform = (coordinate: any) => {
        const x = coordinate[0];
        const y = coordinate[1];

        return [
            (this.scaleY * x - this.rotationY * y + this.rotationY * this.translationY - this.translationX * this.scaleY) / (this.scaleX * this.scaleY - this.rotationY * this.rotationX),
            (-this.rotationX * x + this.scaleX * y + this.rotationX * this.translationX - this.scaleX * this.translationY) / (this.scaleX * this.scaleY - this.rotationY * this.rotationX),
        ];
    };
    _calculateSimilarityTransform = (sourcePoints: any, targetPoints: any) => {
        if (!sourcePoints.length || sourcePoints.length !== targetPoints.length) {
            throw 'source points and target points should be of same size';
        }
        let i: number; // Loop variable
        const numPoints = targetPoints.length; // Number of control points
        let scaleX = 1, scaleY = 0, translationX = 0, translationY = 0;

        // Barycenter
        const sourceBarycenter = { x: 0, y: 0 };
        const targetBarycenter = { x: 0, y: 0 };
        for (i = 0; i < numPoints; i++) {
            sourceBarycenter.x += sourcePoints[i][0];
            sourceBarycenter.y += sourcePoints[i][1];
            targetBarycenter.x += targetPoints[i][0];
            targetBarycenter.y += targetPoints[i][1];
        }
        sourceBarycenter.x /= numPoints;
        sourceBarycenter.y /= numPoints;
        targetBarycenter.x /= numPoints;
        targetBarycenter.y /= numPoints;

        // Deviation from barycenter
        const sourceDeviations = [], targetDeviations = [];
        for (i = 0; i < numPoints; i++) {
            sourceDeviations.push({ x: sourcePoints[i][0] - sourceBarycenter.x, y: sourcePoints[i][1] - sourceBarycenter.y });
            targetDeviations.push({ x: targetPoints[i][0] - targetBarycenter.x, y: targetPoints[i][1] - targetBarycenter.y });
        }

        // Resolution
        let sumXTargetX = 0, sumXTargetY = 0, sumYTargetY = 0, sumYTargetX = 0, sumXSquare = 0, sumYSquare = 0;
        for (i = 0; i < numPoints; i++) {
            sumXTargetX += sourceDeviations[i].x * targetDeviations[i].x;
            sumXTargetY += sourceDeviations[i].x * targetDeviations[i].y;
            sumYTargetY += sourceDeviations[i].y * targetDeviations[i].y;
            sumYTargetX += sourceDeviations[i].y * targetDeviations[i].x;
            sumXSquare += sourceDeviations[i].x * sourceDeviations[i].x;
            sumYSquare += sourceDeviations[i].y * sourceDeviations[i].y;
        }

        // Coefficients
        scaleX = (sumXTargetX + sumYTargetY) / (sumXSquare + sumYSquare);
        scaleY = (sumXTargetY - sumYTargetX) / (sumXSquare + sumYSquare);
        translationX = targetBarycenter.x - scaleX * sourceBarycenter.x + scaleY * sourceBarycenter.y;
        translationY = targetBarycenter.y - scaleY * sourceBarycenter.x - scaleX * sourceBarycenter.y;

        // The Solution
        return [scaleX, -scaleY, translationX, scaleY, scaleX, translationY];
    };

    geoReference = (sourcePoints: any, targetPoints: any, weights?: any, tolerance?: number) => {
        if (!sourcePoints.length || sourcePoints.length !== targetPoints.length) {
            throw 'source and target points should be of same size';
        }
        const numPoints = sourcePoints.length; // Number of control points

        // Creating default weights
        if (!weights?.length) {
            weights = [];
            for (let i = 0; i < numPoints; i++) weights.push(1.0);
        }

        let scaleX = 1, scaleY = 0, scaleFactorX = 1, scaleFactorY = 1, translationX = 0, translationY = 0;
        if (!tolerance) tolerance = 0.0001;

        // Initialization (based on similarity)
        const similarityTransformation = this._calculateSimilarityTransform(sourcePoints, targetPoints);
        scaleX = similarityTransformation[0];
        scaleY = -similarityTransformation[1];
        scaleFactorX = scaleFactorY = Math.sqrt(scaleX * scaleX + scaleY * scaleY);
        scaleX /= scaleFactorX;
        scaleY /= scaleFactorX;
        translationX = similarityTransformation[2];
        translationY = similarityTransformation[5];

        // Barycenter
        const sourceBarycenter = { x: 0, y: 0 };
        const targetBarycenter = { x: 0, y: 0 };
        for (let i = 0; i < numPoints; i++) {
            sourceBarycenter.x += sourcePoints[i][0];
            sourceBarycenter.y += sourcePoints[i][1];
            targetBarycenter.x += targetPoints[i][0];
            targetBarycenter.y += targetPoints[i][1];
        }
        sourceBarycenter.x /= numPoints;
        sourceBarycenter.y /= numPoints;
        targetBarycenter.x /= numPoints;
        targetBarycenter.y /= numPoints;

        // Deviation from barycenter
        const sourceDeviations = [], targetDeviations = [];
        for (let i = 0; i < numPoints; i++) {
            sourceDeviations.push({ x: sourcePoints[i][0] - sourceBarycenter.x, y: sourcePoints[i][1] - sourceBarycenter.y });
            targetDeviations.push({ x: targetPoints[i][0] - targetBarycenter.x, y: targetPoints[i][1] - targetBarycenter.y });
        }

        // Variables
        let sumX = 0, sumY = 0, sumXY = 0, sumXTargetX = 0, sumXTargetY = 0, sumYTargetX = 0, sumYTargetY = 0;
        for (let i = 0; i < numPoints; i++) {
            sumX += sourceDeviations[i].x * sourceDeviations[i].x * weights[i];
            sumXY += sourceDeviations[i].x * sourceDeviations[i].y * weights[i];
            sumY += sourceDeviations[i].y * sourceDeviations[i].y * weights[i];
            sumXTargetX += sourceDeviations[i].x * targetDeviations[i].x * weights[i];
            sumYTargetX += sourceDeviations[i].y * targetDeviations[i].x * weights[i];
            sumXTargetY += sourceDeviations[i].x * targetDeviations[i].y * weights[i];
            sumYTargetY += sourceDeviations[i].y * targetDeviations[i].y * weights[i];
        }

        // Iterations
        let deltaScaleFactorX = 0, deltaScaleFactorY = 0, deltaRotation = 0;
        let A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number;
        let deltaScaleX: number, deltaScaleY: number;
        let divergence = 1e10;

        do {
            A = sumX;
            B = sumY;
            C = scaleFactorX * scaleFactorX * sumX + scaleFactorY * scaleFactorY * sumY;
            D = -scaleFactorY * sumXY;
            E = scaleFactorX * sumXY;
            F = scaleX * sumXTargetX + scaleY * sumXTargetY - scaleFactorX * sumX;
            G = -scaleY * sumYTargetX + scaleX * sumYTargetY - scaleFactorY * sumY;
            H = -scaleFactorX * scaleY * sumXTargetX + scaleFactorX * scaleX * sumXTargetY - scaleFactorY * scaleX * sumYTargetX - scaleFactorY * scaleY * sumYTargetY;

            deltaRotation = (A * B * H - B * D * F - A * E * G) / (A * B * C - B * D * D - A * E * E);
            deltaScaleFactorX = (F - D * deltaRotation) / A;
            deltaScaleFactorY = (G - E * deltaRotation) / A;

            // Numerical divergence problem
            if (Math.abs(deltaScaleFactorX) + Math.abs(deltaScaleFactorY) > divergence) break;

            // New approximation
            deltaScaleX = scaleX * Math.cos(deltaRotation) - scaleY * Math.sin(deltaRotation);
            deltaScaleY = scaleY * Math.cos(deltaRotation) + scaleX * Math.sin(deltaRotation);
            scaleX = deltaScaleX;
            scaleY = deltaScaleY;
            scaleFactorX += deltaScaleFactorX;
            scaleFactorY += deltaScaleFactorY;

            divergence = Math.abs(deltaScaleFactorX) + Math.abs(deltaScaleFactorY);
        } while (Math.abs(deltaScaleFactorX) + Math.abs(deltaScaleFactorY) > tolerance);

        // Return of the barycentric frame
        translationX = targetBarycenter.x - scaleX * scaleFactorX * sourceBarycenter.x + scaleY * scaleFactorY * sourceBarycenter.y;
        translationY = targetBarycenter.y - scaleY * scaleFactorX * sourceBarycenter.x - scaleX * scaleFactorY * sourceBarycenter.y;

        this._rotation = Math.acos(scaleX);
        if (scaleY > 0) this._rotation *= -1;
        if (Math.abs(this._rotation) < Math.PI / 8) {
            this._rotation = Math.asin(-scaleY);
            if (scaleX < 0) this._rotation = Math.PI - this._rotation;
        }
        this._scale = [scaleFactorX, scaleFactorY];
        this._translation = [translationX, translationY];

        // The Solution
        this.matrix = [];
        this.scaleX = scaleX * scaleFactorX;
        this.scaleY = scaleX * scaleFactorY;
        this.rotationX = scaleY * scaleFactorX;
        this.rotationY = -scaleY * scaleFactorY;
        this.translationX = translationX;
        this.translationY = translationY;
    };
}
