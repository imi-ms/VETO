/**
 * This file contains helper functions for importing and exporting files. They are suitable for table-based file formats (csv and xlsx) and for json.
 */

import Data, { DataAttributePart } from "@/types/Data";
import { ExportOptions, ImportOptions } from "./veto-files";
import MetaData from "@/types/MetaData";

/**
 * This function filters a data array according to the export options that the user has selected.
 * The user has selected either "ALL" (all data are being exported), "ONLY_CHECKED" (only the checked rows are exported) or "ONLY_UNCHECKED"
 * (only unchecked rows are being exported)
 * @param data data array to be filtered
 * @param options export options object that contains the users filter option
 * @returns filtered data array
 */
export function filterExportData(data: Array<Data>, options: ExportOptions): Array<Data> {
    const filterFunction = function(d: Data): boolean {
        switch(options.rowsToBeExported) {
            case "ALL":
                return true;
            case "ONLY_CHECKED":
                return d.currentData.checked;
            case "ONLY_UNCHECKED":
                return !d.currentData.checked
        }
    }

    return data.filter(d => filterFunction(d));
}

/**
 * This function returns an array of a specific object containing the value, old value and the current indices according to a given attribute name
 * This function is necessary because the current value and the old value are being kept in different fields in a data object and joining these values
 * are not easily done.
 * @param attribName name of the attribute
 * @param data data object that contains the
 * @returns
 */
export function getAttributePartsWithOldValues(attribName: string, data: Data): Array<{value: string, oldValue?: string, start: number, end: number}> {
    const parts: Array<DataAttributePart> = data.currentData.attributes[attribName]
    const oldParts: Array<DataAttributePart> = data.oldData.attributes[attribName]

    const ret: Array<{value: string, oldValue?: string, start: number, end: number}> = [];
    for(let index = 0; index < parts.length; index += 1) {
        const value: string = parts[index].value!;
        const next: {value: string, oldValue?: string, start: number, end: number} = {value: value, start: parts[index].start!, end: parts[index].end!};

        if (index < oldParts.length) {
          const oldValue: string = oldParts[index].value!;
          if(oldValue !== value) {
            next.oldValue = oldValue;
          }
        }

        ret.push(next);
    }

    return ret;
}

/**
 * This function assumes that a given string value comes from the veto text field in the file to be opened.
 * Such value will either contain the text or the file name of an external text file.
 * In both cases the function will find the text to be annotated and returns it.
 * @param value Content of the veto text field
 * @param options Options Object with further relevant information
 * @param errors Array of error messages in which the function can add further errors
 * @returns The text to be annotated or undefined, if an error occures
 */
export async function getVetoText(value: string, options: ImportOptions, errors: Array<string>): Promise<string | undefined> {
    if(options.multipleFiles) {
        // Loop through the list of opened external text files and try to find a file with the specified file name.
        // If such file is found, load its content.
        for (const file of options.externalTextFiles!) {
            if (file.name === value) {
                return await file.text();
            }
        }

        errors.push(`A record references the external file ${value} but this file was not opened!`);
        return undefined;
    } else {
        // If all the annotation content is stored in a single file, the field value must contain the texts to be annotated
        return value;
    }
}

/**
 * This function will register a given attribute name to a meta data object and assigns a color according to the color scheme in the given options object
 * @param attributeName name of the new attribute
 * @param meta meta data object in which the attribute name needs to be added
 * @param options option object which contains the color scheme selected by the user
 */
export function addAttributeToMetaData(attributeName: string, meta: MetaData, options: ImportOptions): void {
    const numOfAttributes = Object.keys(meta.attributes).length; // Number of already existing attributes

    meta.attributes[attributeName] = {
        color: options.colorScheme[numOfAttributes % options.colorScheme.length],
        validationRegEx: null,
    }
}
