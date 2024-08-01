/* eslint-disable no-var */
/* eslint-disable indent */
/********************************************************************************
This file is COPYRIGHT (c) 2023, The Land Administration Corporation Inc (LAC) ALL RIGHTS RESERVED
This software is the property of The Land Administration Corporation Inc.
It can not be copied, modified, or distributed without the express written permission of The Land Administration Corporation Inc. Contact: info@landadmin.com
The information contained in this software is confidential and proprietary.
*********************************************************************************/
/** Helmert transformation is a transformation method within a three-dimensional space.
*	It is frequently used in geodesy to produce distortion-free transformations from one datum to another.
*	It is composed of scaling o rotation o translation
*	Least squares is used to solve the problem of determining the parameters.
*	[X] = [sx] . [cos -sin] + [tx]
*	[Y]   [sy]   [sin  cos]   [ty]
*
*	With the similarity option the scale is the same along both axis ie. sx = sy
*/
export const square = [
    [0, 0], // x0([0,0]),y0([0,1])   
    [1, 0], // x1([1,0]),y0([1,1])
    [0, 1], // x0([2,0]),y1([2,1])
    [1, 1] // x1([3,0]),y1([3,1])
];
function translate(polygon: number[][], moveBy: number[]) {
    const [tx, ty] = moveBy;
    return polygon.map((coord) => {
        const [x, y] = coord;
        return [x + tx, y + ty];
    });
}
export function scale(shape: number[][], scale: number[], move: number[]) {
    if (move.length === 2) {
        shape = translate(square, move);
    }
    const [sx, sy] = scale;
    return [
        [shape[0][0], shape[0][1]], // x0,y0
        [shape[1][0] * sx, shape[1][1]], // x1,y0
        [shape[2][0], shape[2][1] * sy], // x0,y1
        [shape[3][0] * sx, shape[3][1] * sy], // x1, y1
    ];
}
export function scaleAndRotate(shape: number[][], scaleF: number[], move: number[], angle: number): number[][] {
    shape = scale(shape, scaleF, move);
    const radian = angle * Math.PI / 180; // Convert angle to radians
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const scaledAndRotatedShape = shape.map((coord, index) => {
        if (index === 0) {
            return coord; // Don't rotate the first coordinate
        }
        const [x, y] = coord;
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        return [rotatedX, rotatedY];
    });
    return scaledAndRotatedShape;
}
