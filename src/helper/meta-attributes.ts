import { MetaAttributeType, ValidMetaAttribute } from "@/types/MetaData";

/**
 * Builds the csv column name for the given attribute.
 *
 * @param attributeName Name of the attribute.
 * @param metaData Meta data of the attribute.
 * @return The column name.
 */
export function buildMetaAttributeColumnName(attributeName: string, metaData: ValidMetaAttribute): string {
  switch (metaData.type) {
    case MetaAttributeType.ENUM: {
      return `VETO_META_ENUM_${attributeName}__${metaData.values.join("__")}`;
    }
    case MetaAttributeType.NUMBER: {
      return `VETO_META_NUMBER_${attributeName}`;
    }
    case MetaAttributeType.TEXT: {
      return `VETO_META_TEXT_${attributeName}`;
    }
    default: {
      console.error(`Unhandled MetaAttributeType '${metaData.type}' during column name building!`);
      return "";
    }
  }
}

/**
 * Validates if a value of a meta-attribute is valid.
 *
 * @param value The value to be validated.
 * @param metaData Meta data of the attribute.
 * @return True if the value is valid, false otherwise.
 */
export function validateMetaAttribute(value: string | null, metaData: ValidMetaAttribute): boolean {
  switch (metaData.type) {
    case MetaAttributeType.ENUM: {
      return value === null || metaData.values.includes(value);
    }
    case MetaAttributeType.NUMBER: {
      return value === null || !Number.isNaN(parseFloat(value));
    }
    case MetaAttributeType.TEXT: {
      return true;
    }
    default: {
      console.error(`Unhandled MetaAttributeType '${metaData.type}' during validation!`);
      return false;
    }
  }
}
