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
      active: '#00592E',
      activeHighlight: '#0a874b',
      background: '#ffffff',
      backgroundHighlight: '#f8f9fa',
      border: '#dee2e6',
      disabled: '#6e6e6e',
      error: '#ff0000',
      font: '#000000',
      fontHighlight: '#4f4f4f',
      focus: '#C0CC00',
      highlight: '#9db8d9',
      inactive: '#2e52b1',
      inactiveHighlight: '#4b71d3',
      label: '#ffffff',
      main: '#00592E',
      mainHighlight: '#0a874b',
      scrollbar: '#858585',
      scrollbarBackground: '#eeeeee',
      success: '#008000',
      warning: '#ffa500',
    }
  };
  static readonly DARK: IVetoColorScheme = {
    name: 'Dark',
    scheme: {
      active: '#00592E',
      activeHighlight: '#0a874b',
      background: '#181a1b',
      backgroundHighlight: '#1b1e1f',
      border: '#72757a',
      disabled: '#6e6e6e',
      error: '#ff0000',
      font: '#e8e6e3',
      fontHighlight: '#9a9a9a',
      focus: '#C0CC00',
      highlight: '#325581',
      inactive: '#193786',
      inactiveHighlight: '#2651c8',
      label: '#e8e6e3',
      main: '#00592E',
      mainHighlight: '#0a874b',
      scrollbar: '#515151',
      scrollbarBackground: '#9a9a9a',
      success: '#008000',
      warning: '#ffa500',
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
