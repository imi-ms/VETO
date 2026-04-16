import MetaData, { MetaAttributeType, ValidMetaAttribute, getDefaultMetaData } from "@/types/MetaData";
import { type FileConverter, type ImportOptions, type ImportReturn, type ExportOptions, type ExportReturn, getFilenameWithoutExtension } from "./veto-files";
import Data, { DataAttributePart, MetaAttributeData } from "@/types/Data";
import { addAttributeToMetaData, filterExportData, getAttributePartsWithOldValues, getVetoText } from "./file-functions";
import { JsonAttributeValue, VetoJsonData, VetoJsonFile, isNumberString, isValidVetoJsonData, isVetoJsonFile } from "./json-types";


function getMetaAttributeList(meta: MetaData): Array<{name: string, values?: Array<string>, type: MetaAttributeType}>  {
    return Object.entries(meta.validMetaAttributes).map((a) => {
        const attributeName = a[0];
        const attribute = a[1];
        switch(attribute.type){
            case MetaAttributeType.ENUM:
                return {name: attributeName, values: attribute.values, type: attribute.type}
            case MetaAttributeType.NUMBER:
            case MetaAttributeType.TEXT:
                return {name: attributeName, type: attribute.type}
        }
    });
}

function dataToVetoJsonObject(data: Data, meta: MetaData, options: ExportOptions): VetoJsonData {
    // Only if at least one meta attribute is part of the opened file, include the values of the meta attribute in the data object of the new json file
    const includeMetaAttribs = Object.keys(meta.validMetaAttributes).length > 0;
    const includeAdditionalFields = Object.keys(data.otherColumns).length > 0;

    const result: VetoJsonData = {
        attributes: {},
        metaAttributes: includeMetaAttribs ? {} : undefined,
        additionalFields: includeAdditionalFields ? {} : undefined,
        checked: data.currentData.checked
    };

    // Depending on whether external text files are being used or not, set the path attribute or the text attribute
    if(meta.usingExternalTextFiles) result.path = data.externalTextFileName;
    else result.text = data.text;

    for(const [attribName, attrib] of Object.entries(data.currentData.attributes)) {
        let jsonAttrib: Array<JsonAttributeValue | string>;

        switch(options.columnsToBeExported) {
            case "ALL":
            case "ONLY_VETO":
              jsonAttrib = attrib.map(a => {
                return {value: a.value, start: a.start, end: a.end} as JsonAttributeValue;
              });
                break;
            case "ONLY_ATTRIBS":
                jsonAttrib = attrib.map(a => a.value!);
                break;
        }

        result.attributes[attribName] = jsonAttrib.length == 1 ? jsonAttrib[0] : jsonAttrib;
    }

    if (options.columnsToBeExported === "ALL" || options.columnsToBeExported === "ONLY_VETO") {
      result.oldAttributes = {};
      for(const [attribName, attrib] of Object.entries(data.oldData.attributes)) {
        let jsonAttrib = attrib.map(a => {
          return {value: a.value, start: a.start, end: a.end} as JsonAttributeValue;
        });

        result.oldAttributes[attribName] = jsonAttrib.length == 1 ? jsonAttrib[0] : jsonAttrib;
      }

      result.oldMetaAttributes = {};
      for(const [attribName, attrib] of Object.entries(data.oldData.metaAttributes)) {
        result.oldMetaAttributes[attribName] = attrib.map(a => a.value);
      }
    }

    if(includeMetaAttribs) {
        for(const [metaAttribName, metaAttrib] of Object.entries(data.currentData.metaAttributes)) {
            result.metaAttributes![metaAttribName] = metaAttrib.map(m => m.value!);
        }
    }

    if(includeAdditionalFields) {
        for(const [fieldName, fieldValue] of Object.entries(data.otherColumns)) {
            result.additionalFields![fieldName] = fieldValue;
        }
    }

    return result;
}

function loadAttributes(vetoJsonFile: VetoJsonFile, meta: MetaData, options: ImportOptions, errors: Array<string>): void {
    // Read the attributes from the array
    vetoJsonFile.attributes.forEach(attribName => {
      addAttributeToMetaData(attribName, meta, options);
    });

    // Ensure that all attributes are included in the other entries and no other entries are present
    for(let index = 0; index < vetoJsonFile.data.length; index += 1) {
        const current: VetoJsonData = vetoJsonFile.data[index];

        Object.keys(meta.attributes).forEach(attribName => {
            if(!Object.hasOwn(current.attributes, attribName)) {
                errors.push(`The attribute '${attribName}' is missing in a data object.`);
                return;
            }
        });

        Object.keys(current.attributes).forEach(attribName => {
            if(!Object.hasOwn(meta.attributes, attribName)) {
                errors.push(`One data object contains an attribute named '${attribName}' but this attribute is not included in the first attribute entry.`);
                return;
            }
        });

        if (Object.hasOwn(current, "oldAttributes"))
        {
          Object.keys(current.oldAttributes!).forEach(attribName => {
            if (!Object.hasOwn(meta.attributes, attribName)) {
              errors.push(`One old data object contains an attribute named '${attribName}' but this attribute is not included in the first attribute entry.`);
            }
          });
        }
    }
}

function loadMetaAttributes(vetoJsonFile: VetoJsonFile, meta: MetaData, errors: Array<string>): void {
    if(!vetoJsonFile.metaAttributes) return;

    for(const [attribName, attrib] of Object.entries(vetoJsonFile.metaAttributes)) {
        const next: ValidMetaAttribute = {
            type: attrib.type,
            values: attrib.possibleValues ? attrib.possibleValues : []
        }
        meta.validMetaAttributes[attribName] = next;
    }
}

async function vetoJsonObjectToData(obj: VetoJsonData, meta: MetaData, options: ImportOptions, errors: Array<string>): Promise<Data | null> {
    const textField: string = options.multipleFiles ? obj.path! : obj.text!;
    const text: string | undefined = await getVetoText(textField, options, errors);

    if(text === undefined) {
        return null;
    }

    const ret: Data = {
      currentData: {
        attributes: {},
        checked: obj.checked,
        metaAttributes: {},
      },
      changelogBase: {
        attributes: {},
        checked: obj.checked,
        metaAttributes: {},
      },
      oldData: {
        attributes: {},
        checked: obj.checked,
        metaAttributes: {},
      },
      otherColumns: {},
      text: text,
    };


    // Closure for adding a json attribute from the attributes object to the data
    const addToAttributes = function(attribName: string, attrib: JsonAttributeValue) {
        const next: DataAttributePart = {
            id: meta.nextId,
            start: attrib.start,
            end: attrib.end,
            value: attrib.value
        };
        meta.nextId += 1;

        // Associate a list of attribute parts to the given attribute name if necessary
        if(!ret.currentData.attributes[attribName]) ret.currentData.attributes[attribName] = [];

        ret.currentData.attributes[attribName].push(next);
    };

  const addToOldAttributes = function(attribName: string, attrib: JsonAttributeValue) {
    const next: DataAttributePart = {
      id: -1,
      start: attrib.start,
      end: attrib.end,
      value: attrib.value
    };

    // Associate a list of attribute parts to the given attribute name if necessary
    if (!ret.oldData.attributes[attribName]) ret.oldData.attributes[attribName] = [];

    ret.oldData.attributes[attribName].push(next);
  };

    for(const [attribName, attrib] of Object.entries(obj.attributes)) {
        // Based on the integrity checks for the data attribute, assume that attrib is of type JsonAttributeValue or Array<JsonAttributeValue>
        if(Array.isArray(attrib)) {
            const attribArr = attrib as Array<JsonAttributeValue>;
            attribArr.forEach(a => { addToAttributes(attribName, a)});
            meta.containsMultiValueAttributes = true;
        }else {
            addToAttributes(attribName, attrib as JsonAttributeValue);
        }
    }

    if (Object.hasOwn(obj, "oldAttributes"))
    {
      for(const [attribName, attrib] of Object.entries(obj.oldAttributes!)) {
        // Based on the integrity checks for the data attribute, assume that attrib is of type JsonAttributeValue or Array<JsonAttributeValue>
        if(Array.isArray(attrib)) {
          const attribArr = attrib as Array<JsonAttributeValue>;
          attribArr.forEach(a => { addToOldAttributes(attribName, a)});
        } else {
          addToOldAttributes(attribName, attrib as JsonAttributeValue);
        }
      }
    }

    for(const [metaAttributeName, metaAttrib] of Object.entries(meta.validMetaAttributes)) {
        const values: Array<string> | undefined = obj.metaAttributes![metaAttributeName];
        if(values === undefined) {
            errors.push(`Meta Attribute '${metaAttributeName}' is missing in an entry.`);
            continue;
        }

        // meta attributes
        values.forEach(v => {
            switch(metaAttrib.type) {
                case MetaAttributeType.ENUM:
                    if(!metaAttrib.values.includes(v)) {
                        errors.push(`Unsupported value '${v}' in enum meta attribute '${metaAttributeName}`);
                        return;
                    }
                    break;
                case MetaAttributeType.NUMBER:
                    if(!isNumberString(v)) {
                        errors.push(`Unsupported value: '${v}' of meta attribute '${metaAttributeName}' is not a number`);
                        return;
                    }
                    break;
                case MetaAttributeType.TEXT:
                    break;
            }

            const next: MetaAttributeData = {
                value: v,
                id: meta.nextId
            }
            meta.nextId += 1;

            if(!ret.currentData.metaAttributes[metaAttributeName]) ret.currentData.metaAttributes[metaAttributeName] = [];
            ret.currentData.metaAttributes[metaAttributeName].push(next);
        });

        // old meta attributes
        const oldValues: Array<string | null> | undefined = obj.oldMetaAttributes![metaAttributeName];
      if (oldValues === undefined) {
        errors.push(`Meta Attribute '${metaAttributeName}' is missing in an entry.`);
        continue;
      }

      if(!ret.oldData.metaAttributes[metaAttributeName]) ret.oldData.metaAttributes[metaAttributeName] = [];
      oldValues.forEach(value => {
        ret.oldData.metaAttributes[metaAttributeName].push({id: -1, value});
      });
    }

    // add additional fields to the data object
    if(obj.additionalFields !== undefined) {
        for(const [fieldName, fieldValue] of Object.entries(obj.additionalFields)) {
            ret.otherColumns[fieldName] = fieldValue as string;
        }
    }

    return ret;
}

export default class JsonFileConverter implements FileConverter {
    async toFile(meta: MetaData, data: Data[], options: ExportOptions): Promise<ExportReturn> {
        const errors: Array<string> = [];

        const filteredData = filterExportData(data, options);
        const jsonMetaAttributes = getMetaAttributeList(meta);
        const jsonData: Array<VetoJsonData> = filteredData.map(d => dataToVetoJsonObject(d, meta, options));

        // Init with data
        const jsonFile: VetoJsonFile = {
            attributes: Object.keys(meta.attributes),
            data: jsonData
        };

        // Add the meta attributes
        if(jsonMetaAttributes.length > 0){
            jsonFile.metaAttributes = {};
            jsonMetaAttributes.forEach(a => {
                jsonFile.metaAttributes![a.name] = {type: a.type, possibleValues: a.values}
            })
        }

        const jsonString: string = JSON.stringify(jsonFile, null, 2);

        return {errors: errors, fileContent: jsonString};
    }

    async fromFile(file: File, options: ImportOptions): Promise<ImportReturn> {
        const meta: MetaData = getDefaultMetaData(getFilenameWithoutExtension(file.name));
        meta.textColumnName = "text";
        const fileContent: string = await file.text();

      const importReturn: ImportReturn = {
        data: [],
        meta: meta,
        errors: [],
        attributeValidation: {},
        hasCheckColumn: false
      }

        let obj: any = null;
        try {
            obj = JSON.parse(fileContent);
        } catch (error) {
            // SyntaxError
            importReturn.errors.push(`Could not load file. Reason: ${error}`);
            return importReturn;
        }

        if(!isVetoJsonFile(obj, importReturn.errors)) {
          return importReturn;
        }

        const vetoJsonFile: VetoJsonFile = obj as VetoJsonFile;

        // Filter out all data objects in the parsed json object that do not fullfill our integrity criteria
        const validVetoDataObjs: Array<VetoJsonData> = [];
        for(let vetoDataObj of vetoJsonFile.data) {
            if(isValidVetoJsonData(vetoDataObj, options, importReturn.errors)) {
                validVetoDataObjs.push(vetoDataObj);
            }
        }

        loadAttributes(vetoJsonFile, importReturn.meta, options, importReturn.errors);
        loadMetaAttributes(vetoJsonFile, importReturn.meta, importReturn.errors);

        const data: Array<Data> = [];
        for(obj of validVetoDataObjs) {
            const d: Data | null = await vetoJsonObjectToData(obj, importReturn.meta, options, importReturn.errors);
            if(d !== null) {
                importReturn.data.push(d);
            }
        }

      return importReturn;
    }
}
