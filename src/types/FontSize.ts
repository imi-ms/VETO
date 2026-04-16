export type FontSizeType = 'FOR_ANTS' | 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HUGE'

export interface IFontSize {
  type: FontSizeType
  label: string
  fontSize: string
}

export class FontSize {
  static readonly FOR_ANTS: IFontSize = {type: 'FOR_ANTS', label: 'For ants', fontSize: '6px'};
  static readonly TINY: IFontSize = {type: 'TINY', label: 'Tiny', fontSize: '10px'};
  static readonly SMALL: IFontSize = {type: 'SMALL', label: 'Small', fontSize: '13px'};
  static readonly MEDIUM: IFontSize = {type: 'MEDIUM', label: 'Medium', fontSize: '16px'};
  static readonly LARGE: IFontSize = {type: 'LARGE', label: 'Large', fontSize: '20px'};
  static readonly HUGE: IFontSize = {type: 'HUGE', label: 'Huge', fontSize: '24px'};

  static getValueOrder(type: FontSizeType): IFontSize {
    return FontSize[type];
  }
}

