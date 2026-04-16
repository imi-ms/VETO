import {Linebreak} from "@/types/FileData";

export interface DataAttributePart {
    id: number,                 // denotes the ID with which the various related attribute components can be distinguished
    start: null | number,
    end: null | number,
    value: null | string
}


export interface DataAttributes {
    [attribName: string]: Array<DataAttributePart>
}

/**
 * Data from the import used for the changelog
 */
export interface VetoData {
  attributes: DataAttributes
  checked: boolean,
  metaAttributes: {
    [attributeName: string]: MetaAttributeData[]
  }
}

export default interface Data {
  externalTextFileName?: string,          // Iff the annotated text lies in a different file, this value specifies its name
  textLineBreak: Linebreak
  currentData: VetoData
  changelogBase: VetoData
  oldData: VetoData
  otherColumns: {
    [columnName: string]: string
  }
  text: string,
}

export interface MetaAttributeData {
    id: number
    value: null | string
}
