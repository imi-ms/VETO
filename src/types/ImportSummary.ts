export type AttributeValidationObject = { [attributeName: string]: AttributeValidationData }
export interface AttributeValidationData {
  VETO_ATTR_OLD: boolean,
  VETO_ATTR_END: boolean,
  VETO_ATTR_START: boolean,
  VETO_ATTR_VALUE: boolean,
}

export default interface ImportSummary {
  attributes: AttributeValidationObject
  errors: Array<string>
  filename: string
  hasCheckColumn: boolean
  hasImport: boolean
  metaAttributes: Array<String>
  otherColumns: Array<string>
  textColumn: string | null
}
