/**
 * File containing all types/interfaces/classes of veto color schemes.
 *
 * @author Tobias Brix
 */

import { Color } from "@/types/Color";

/**
 * Type of veto color scheme.
 *
 * @prop primary - Main color of buttons
 * TODO: Font, Background
 */
export type VetoColorSchemeType = {
  active: Color,
  activeHighlight: Color,
  background: Color,
  backgroundHighlight: Color,
  border: Color,
  disabled: Color,
  error: Color,
  font: Color,
  fontHighlight: Color,
  focus: Color,
  highlight:Color
  inactive: Color,
  inactiveHighlight: Color,
  label: Color,
  main: Color,
  mainHighlight: Color,
  scrollbar: Color,
  scrollbarBackground: Color,
  success: Color,
  warning: Color,
}

/**
 * Interface of veto color schemes.
 *
 * @prop name - Name of the color scheme used as label in inputs.
 * @prop scheme - JSON of colors.
 */
export interface IVetoColorScheme {
    name: string,
    scheme: VetoColorSchemeType,
}

/**
 * Class containing all available veto color schemes.
 *
 * It is basically a enum class. Each veto color scheme is implemented as static property.
 * The Name of the property is used as ID for identification and serialization. New color schemes can be added
 * by adding a new property.
 */
export class VetoColorScheme
{
  static readonly DEFAULT: IVetoColorScheme = {
    name: 'Default',
    scheme: {
      active: '#0f766e',
      activeHighlight: '#0d9488',
      background: '#f6f8fb',
      backgroundHighlight: '#ffffff',
      border: '#d7dee7',
      disabled: '#9aa6b2',
      error: '#dc2626',
      font: '#0f172a',
      fontHighlight: '#475569',
      focus: '#14b8a6',
      highlight: '#d9e7ff',
      inactive: '#2563eb',
      inactiveHighlight: '#3b82f6',
      label: '#f8fafc',
      main: '#0f766e',
      mainHighlight: '#0d9488',
      scrollbar: '#8ca0b3',
      scrollbarBackground: '#dbe4ee',
      success: '#15803d',
      warning: '#d97706',
    }
  };
  static readonly DARK: IVetoColorScheme = {
    name: 'Dark',
    scheme: {
      active: '#0f766e',
      activeHighlight: '#14b8a6',
      background: '#1a2029',
      backgroundHighlight: '#232b36',
      border: '#425162',
      disabled: '#5f6f81',
      error: '#ef4444',
      font: '#edf2f8',
      fontHighlight: '#a9b5c5',
      focus: '#2dd4bf',
      highlight: '#304966',
      inactive: '#2563eb',
      inactiveHighlight: '#3b82f6',
      label: '#edf2f8',
      main: '#0f766e',
      mainHighlight: '#14b8a6',
      scrollbar: '#71859b',
      scrollbarBackground: '#2c3746',
      success: '#22c55e',
      warning: '#f59e0b',
    }
  };

    /**
     * Helper function used to dynamically map from the ID (property name) to the IVetoColorScheme.
     *
     * @param propName - ID (property name) of the veto color scheme.
     * @returns The associated veto color scheme to the propName. If the propName does not exist, DEFAULT is used.
     */
    static getVetoColorScheme(propName: string): IVetoColorScheme {
        const found =  Object.keys(VetoColorScheme).find(key => key === propName) as keyof typeof VetoColorScheme;
        return found ? VetoColorScheme[found] as IVetoColorScheme : VetoColorScheme.DEFAULT;
    }
}
