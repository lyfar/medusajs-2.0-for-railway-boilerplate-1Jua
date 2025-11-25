'use client';

import MaterialSelector, { Material } from '../material-selector';
import { InfoPopover } from './info-popover';

interface MaterialSectionProps {
  material: Material;
  onMaterialChange: (material: Material) => void;
}

export default function MaterialSection({ material, onMaterialChange }: MaterialSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-ui-fg-base">Material / effects</h3>
          <InfoPopover
            title="Material options"
            description="See how each finish looks—vinyl for durability, eggshell for matte texture, hologram/foil for shine, and UV gloss for extra pop."
          />
        </div>
      </div>
      <MaterialSelector selectedMaterial={material} onMaterialChange={onMaterialChange} />
    </div>
  );
}
