/**
 * This file contains the type declarations for the json import and export.
 * It also contains corresponding type guards which are being used by the import functions to check if the loaded file is valid.
 */

import { MetaAttributeType } from "@/types/MetaData"
import { ImportOptions } from "./veto-files"

/**
 * This interface represents a veto json file and serves as the root of the json tree
 */
export interface VetoJsonFile {
    attributes: Array<string>
    metaAttributes?: {
        [attribName: string]: VetoJsonMetaAttribute
    }
    data: Array<VetoJsonData>
}

/**
 * This interface contains information about a specific meta attribute.
 * It contains its type and also possible values if the type is enum.
 * The root element of a veto json file has a direct child object which associates each meta attribute name with
 * these informations.
 */
export interface VetoJsonMetaAttribute {
    type: MetaAttributeType,
    possibleValues?: Array<string>
}

/**
 * This interface represents the value of a specific attribute inside a data object.
 * It includes the text value, the old text values and the start and end indices of the new value.
 */
export interface JsonAttributeValue {
    value: string,
    start: number,
    end: number
}

/**
 * This interface represents a data object (a record of the veto table) as an alternative form in the json file.
 * It includes the values for the attributes and the meta attributes.
 * Depending on whether external text files are being used or not, it also contains the text in the text field or the
 * file name of the external text file. It is not allowed that both fields are defined.
 */
export interface VetoJsonData {
    text?: string,
    path?: string,
    checked: boolean,
    attributes: {
      [attributeName: string]: Array<JsonAttributeValue | string> | JsonAttributeValue | string
    },
    oldAttributes?: {
        [attributeName: string]: Array<JsonAttributeValue> | JsonAttributeValue
    }
    metaAttributes?: {
        [attributeName: string]: Array<string>
    },
    oldMetaAttributes?: {
        [attributeName: string]: Array<string | null>
    },
    additionalFields?: {
      [columnName: string]: string | undefined
    }
}

/**
 * This type guard checks if a given value is of type 'Object', which exlude undefined and null values. *
 * Arrays are not considered to be objects in this context.
 * @param obj value to be type checked
 * @returns Returns true if and only if obj is an Object
 */
function isObject(obj: any): obj is Object {
    return obj instanceof Object && !Array.isArray(obj)
}

/**
 * This type guards checks if obj is of type VetoJsonData. It also writes error messages to an array
 * @param obj
 * @param errors
 * @returns true if and only if obj is of type VetoJsonData
 */
export function isVetoJsonData(obj: any, errors: Array<string>): obj is VetoJsonData {
    const objAsRow: VetoJsonData = obj as VetoJsonData;
    if(!objAsRow.text === undefined && objAsRow.path === undefined) {
        errors.push(`At least one of the attributes 'text' and 'path' must be specified in each data object!`);
        return false;
    }

    if(objAsRow.attributes === undefined) {
        errors.push(`Missing attribute object in data object!`);
        return false;
    }

    for(const [attribName, attrib] of Object.entries(objAsRow.attributes)) {
        // The attribute is valid if it is either a string or an JsonAttributeValue or an array with these types
        if(typeof attrib === "string") continue;
        if(isJsonAttributeValue(attrib)) continue;
        if(isStringArray(attrib)) continue;
        if(isJsonAttributeValueArray(attrib)) continue;

        errors.push(`The json file contains at least one entry with an attribute that does not fullfills the required syntax!`);
        return false;
    }

    return true;
}

/**
 * This function checks if a given VetoJsonData object is 'valid' in aspects of integrity.
 * It is not allowed that the path- and the text-field are defined at the same time.
 * Whether external text files are being used or not decides which of these two fields must be defined.
 * If external text files are being used, the object must inclued the path field, which includes the file name of the external text file.
 * Otherwise the text field must be defined and must include the text of this record.
 * The functions also checks if the data's attributes are of a type that is supported for importing.
 * If at least one attribute value is a string or a string array, the data is not valid.
 * @param jsonObj VetoJsonData object to validate
 * @param options options object which includes the information whether external text files are being used or nor
 * @param errors Array of errors the function can add errors to
 * @returns true if and only if the given VetoJsonData object is valid in aspect of integrity
 */
export function isValidVetoJsonData(jsonObj: VetoJsonData, options: ImportOptions, errors: Array<string>): boolean {
    // Depending on whether external text files are being used or not, a valid veto json data has to have the 'path'- or the 'text'-field to be specified.
    // It is not allowed that both fields are specified
    if(options.multipleFiles) {
        if(jsonObj.path === undefined) {
            errors.push(`Missing 'path'-value in loaded json file.`);
            return false;
        }

        if(jsonObj.text !== undefined) {
            errors.push(`Data object specifies the 'text'-field although external text files are being used.`);
            return false;
        }
    }else {
        if(jsonObj.text === undefined) {
            errors.push(`Missing 'text'-value in loaded json file.`);
            return false;
        }

        if(jsonObj.path !== undefined) {
            errors.push(`Data object specifies the 'path'-field although no external text files are being used.`);
            return false;
        }
    }

    for(const [attribName, attrib] of Object.entries(jsonObj.attributes)) {
        if(!isJsonAttributeValue(attrib) && !isJsonAttributeValueArray(attrib)) {
            errors.push("An attribute is of type string or a string array which do not include any index information.");
            return false;
        }
    }

    return true;
}

/**
 * This type guard checks if a value is of type VetoJsonFile. It also writes error messages to an array
 * @param obj value to check
 * @param errors array of errors
 * @returns true if and only if the given value is of type VetoJsonFile
 */
export function isVetoJsonFile(obj: any, errors: Array<string>): obj is VetoJsonFile {
    if(!isObject(obj)) return false;
    if(!obj["data"]) {
        errors.push("The opened json file contains no data array!");
        return false;
    }

    if(!isJsonDataArray(obj.data, errors)) return false;

    // meta attribute objects are not required but if they are included, an integrity check must be done
    if(obj["metaAttributes"]) {
        if(!isMetaAttributeObj(obj.metaAttributes, errors)) return false;
    }

    return true;
}

/**
 * This type guard checks if a given value is a meta attribute in the json file.
 * These objects are a child element of each veto json file and represent a collection of all meta attributes used in the file.
 * They associate the name of the json meta attribute with further information about it
 * @param obj value to be type checked
 * @param errors array the type guard can add error messages to
 * @returns true if and only if the given value if of the described type.
 */
export function isMetaAttributeObj(obj: any, errors: Array<string>): obj is {[attribName: string]: VetoJsonMetaAttribute} {
    if(!isObject(obj)) return false;
    for(const key of Object.keys(obj)) {
        if(!isVetoJsonMetaAttribute(obj[key])) {
            errors.push(`The meta attribute with the name '${key}' is not a valid meta attribute object.`);
            return false;
        }
    }
    return true;
}

/**
 * This type guard checks if the given value is of type VetoJsonMetaAttribute
 * @param obj value to be type checked
 * @returns true if and only if the given value is of type VetoJsonMetaAttribute
 */
export function isVetoJsonMetaAttribute(obj: any): obj is VetoJsonMetaAttribute {
    if(!isObject(obj)) return false;
    if(!obj["type"]) return false;
    if(!Object.values(MetaAttributeType).includes(obj.type)) return false;

    switch(obj.type as MetaAttributeType) {
        case MetaAttributeType.NUMBER:
        case MetaAttributeType.TEXT:
            // assert that no "possible values"-array is given since number and text dont support this constraint
            if(obj["possibleValues"]) return false;
            break;
        case MetaAttributeType.ENUM:
            if(!obj["possibleValues"]) return false;    // If obj is a meta attribute of type enum, assert that some possible values are given
            if(!Array.isArray(obj.possibleValues)) return false;
            for(const possibleString in obj.possibleValues) {
                // return false if at least one element of the array is not a string
                if(typeof possibleString !== 'string') return false;
            }
            break;
    }

    return true;
}

/**
 * This type guard checks if a given value is an array of VetoJsonData.
 * Every valid veto json file has such an array as a direct child element.
 * They represent a record in the veto table
 * @param obj value to be type checked
 * @param errors array of error the type guard can add error messages to
 * @returns true if and only if the given value is of type Array<VetoJsonData>
 */
export function isJsonDataArray(obj: any, errors: Array<string>): obj is Array<VetoJsonData> {
    if(!Array.isArray(obj)) {
        errors.push(`The 'data'-attribute in the json file is must be an array!`);
        return false;
    }
    const arr: Array<any> = obj as Array<any>;
    for(const element of arr) {
        if(!isVetoJsonData(element, errors)) return false;
    }
    return true;
}


/**
 * This type guard checks if a given value is of type JsonAttributeValue.
 * @param obj value to be type checked
 * @returns true if and only if the given value is of type JsonAttributeValue
 */
export function isJsonAttributeValue(obj: any): obj is JsonAttributeValue {
    if(!isObject(obj)) return false;
    if(obj["value"] === undefined || obj["start"] === undefined || obj["end"] === undefined) return false;

    if((obj.start !== null && typeof obj.start !== "number") || (obj.end !== null && typeof obj.end !== "number")) return false;

    if(obj.value !== null && typeof obj.value !== "string") return false;

    return true;
}

/**
 * This type guard checks if a given value is an array of JsonAttributeValue.
 * Such arrays are used when the corresponding attribute has several non-contingous values
 * @param obj value to be type checked
 * @returns true if and only if the given values is of type Array<JsonAttributeValue>
 */
export function isJsonAttributeValueArray(obj: any): obj is Array<JsonAttributeValue> {
    if(!Array.isArray(obj)) return false;

    for(const current of obj) {
        if(!isJsonAttributeValue(current)) return false;
    }

    return true;
}

/**
 * This type guard checks if a given value is a string array
 * @param obj value to be type checked
 * @returns true if and only if the given value is a string array
 */
export function isStringArray(obj: any): obj is Array<string> {
    if(!Array.isArray(obj)) return false;

    for(const current of obj) {
        if(typeof current !== "string") return false;
    }

    return true;
}

/**
 * This function checks if a string represents a number
 * @param value string to be checked
 * @returns true if and only if the given string represents a number
 */
export function isNumberString(value: string): boolean {
    return !isNaN(Number(value));
}
