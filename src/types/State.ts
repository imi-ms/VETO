import MetaData from "@/types/MetaData";
import Data from "@/types/Data";
import {AfterLabelingMode} from "./AfterLabelingMode";
import { IValueOrder } from "./ValueOrder";
import { Color } from "@/types/Color";
import { KeyboardAction } from "./KeyboardAction";
import { TrimGroup, TrimState } from "@/types/TrimGroup";

export enum ChangeAction {
    ADD = "ADD",
    CHECK = "CHECK",
    UPDATE = "UPDATE",
    UPDATE_META = "UPDATE_META",
    DELETE = "DELETE",
}

export interface RowChangelog {
    action: ChangeAction,
    attributeName: null | string,
    check: null | boolean,
    end: null | number,
    id: number | null,
    metaValue: string | null
    start: null | number,
    valueIndex: null | number,
}

export interface Changelog {
    changes : {
        [index: number]: RowChangelog[]
    },
    exportedAllChanges: boolean,
    fileName: string,
}

export interface AppSettings {
    afterLabelingAction: AfterLabelingMode,
    annotationColorScheme: string,
    vetoColorScheme: string,
    highlightColor: Color,
    ignoreDifferenceWhitespace: boolean,
    ignoreLineBreaks: boolean,
    ignoreTabs: boolean,
    ignoreSpaces: boolean,
    keepSearchFocus: boolean,
    trimGroups: Record<TrimGroup, TrimState>,
    matchEntireWord: boolean,
    keyboardActions: {
        [index in KeyboardAction]: string
    }
}

export interface State {
    appSettings: AppSettings,
    changelog: Changelog,
    changelogSaved: boolean,
    columnData: MetaData,
    currentField: string | null,
    currentRow: number,
    currentValueIndex: number | null,
    currentValueOrder: IValueOrder,
    data: Array<Data>,
}
