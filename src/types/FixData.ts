import { Occurrence } from "./Occurrence";

export interface FixData {
    attributeName: string,
    color: string,
    rowIndex: number,
    currentEnd: null | number,
    currentStart: null | number,
    currentValue: null | string,
    occurrences: Occurrence[],
    valueIndex: number,
    valueOfIndices: null | string,
    valueOfIndicesPre: string,
    valueOfIndicesPost: string,
}
