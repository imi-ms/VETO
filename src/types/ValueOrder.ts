import { DataAttributePart } from "./Data"

export type ValueOrderType = 'END' | 'ID' | 'START' | 'VALUE'

export interface IValueOrder {
    type: ValueOrderType,
    label: string,
    sortFunction: (a: DataAttributePart, b: DataAttributePart) => number,
}

export class ValueOrder {
    static readonly END: IValueOrder = {type: 'END', label: 'End Position', sortFunction: compareByEnd};
    static readonly ID: IValueOrder = {type: 'ID', label: 'Initial Order', sortFunction: compareById};
    static readonly START: IValueOrder = {type: 'START', label: 'Start Position', sortFunction: compareByStart};
    static readonly VALUE: IValueOrder = {type: 'VALUE', label: 'Value', sortFunction: compareByValue};

    static getValueOrder(type: ValueOrderType): IValueOrder {
        return ValueOrder[type];
    }
}

function compareByStart(a: DataAttributePart, b: DataAttributePart): number {
    if (a.start === null && b.start === null) return 0;
    if (a.start === null) return 1;
    if (b.start === null) return -1;
    return a.start - b.start;
}

function compareByEnd(a: DataAttributePart, b: DataAttributePart): number {
    if (a.end === null && b.end === null) return 0;
    if (a.end === null) return 1;
    if (b.end === null) return -1;
    return a.end - b.end;
}

function compareById(a: DataAttributePart, b: DataAttributePart): number {
    return a.id - b.id;
}

function compareByValue(a: DataAttributePart, b: DataAttributePart): number {
    if (a.value === null && b.value === null) return 0;
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    const aLower = a.value.toLowerCase();
    const bLower = b.value.toLowerCase();

    if (aLower < bLower) return -1;
    if (aLower > bLower) return 1;
    return 0;
}
