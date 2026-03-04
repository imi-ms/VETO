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
                                                       scheme: ['#BB0000', '#0000BB', '#BBBB00', '#00BB00', '#00BBBB', '#BB00BB']};
    static readonly IBM: IAnnotationColorScheme     = {name: 'IBM',
                                                       scheme: ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000']};
    static readonly WONG: IAnnotationColorScheme    = {name: 'Wong',
                                                       scheme: ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7' ]};
    static readonly TOL: IAnnotationColorScheme     = {name: 'Tol',
                                                       scheme: ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#882255']};

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