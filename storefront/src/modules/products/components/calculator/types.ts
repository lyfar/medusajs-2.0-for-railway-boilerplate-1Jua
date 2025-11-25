export type Shape = 'rectangle' | 'square' | 'circle' | 'diecut';

export type Material = 
  | 'vinyl' 
  | 'egg_shell'
  | 'hologram_egg_shell'
  | 'transparent_egg_shell'
  | 'gold_silver_foil'
  | 'uv_gloss';

export type Format = 'sheets' | 'rolls';

export type Peeling = 'easy_peel' | 'individual_cut';

export interface Dimensions {
  width?: number
  height?: number
  diameter?: number
}
