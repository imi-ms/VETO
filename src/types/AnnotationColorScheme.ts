/**
 * File containing all types/interfaces/classes of annotation color schemes.
 * 
 * @author Tobias Brix
 */

import { Color } from "@/types/Color";

/**
 * Type of annotation color scheme.
 * 
 * A simple array containing HEX colors.
 */
export type AnnotationColorSchemeType = Array<Color>

/**
 * Interface of annotation color schemes.
 * 
 * @prop name - Name of the color scheme used as label in inputs.
 * @prop scheme - Array of colors.
 */
export interface IAnnotationColorScheme {
    name: string,
    scheme: AnnotationColorSchemeType,
} 

/**
 * Class containing all available annotation color schemes.
 * 
 * It is basically a enum class. Each annotation color scheme is implemented as static property. 
 * The Name of the property is used as ID for identification and serialization. New color schemes can be added
 * by adding a new property. 
 */
export class AnnotationColorScheme
{    
    static readonly RAINBOW: IAnnotationColorScheme = {name: 'Rainbow',
                                                       scheme: ['#C96565', '#667FD3', '#C3B455', '#69B171', '#5FAFB7', '#A66FC0']};
    static readonly IBM: IAnnotationColorScheme     = {name: 'IBM',
                                                       scheme: ['#7D9DFA', '#8E78E4', '#C35A95', '#D87E45', '#D4A24D']};
    static readonly WONG: IAnnotationColorScheme    = {name: 'Wong',
                                                       scheme: ['#5E6C7E', '#BE9242', '#5EA8D1', '#4C9B7E', '#CABD4F', '#4D82B2', '#C0703F', '#AA79B0' ]};
    static readonly TOL: IAnnotationColorScheme     = {name: 'Tol',
                                                       scheme: ['#5E5EA0', '#4A9466', '#4E9D93', '#79B5D3', '#C1AF5A', '#AE6476', '#965F9C', '#84516D']};

    /**
     * Helper function used to dynamically map from the ID (property name) to the IAnnotationColorScheme.
     * 
     * @param propName - ID (property name) of the annotation color scheme.
     * @returns The associated annotation color scheme to the propName. If the propName does not exist, RAINBOW is the default.
     */
    static getColorScheme(propName: string): IAnnotationColorScheme {
        const found =  Object.keys(AnnotationColorScheme).find(key => key === propName) as keyof typeof AnnotationColorScheme;
        return found ? AnnotationColorScheme[found] as IAnnotationColorScheme : AnnotationColorScheme.RAINBOW;
    }
}
