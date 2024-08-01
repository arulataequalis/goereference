import { fromTriangles, rotate } from "transformation-matrix";

export function georeference(sourcePoints:any[],destPoints:any[]){
    const matrix = fromTriangles(sourcePoints, destPoints);
    return {
        scale:[matrix.a,matrix.d],
        translation: [matrix.e,matrix.f],
        rotate: [matrix.b,matrix.c]
    }
}