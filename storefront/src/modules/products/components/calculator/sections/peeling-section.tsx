'use client';

import PeelingSelector from '../peeling-selector';
import { Peeling } from '../types';
import { InfoPopover } from './info-popover';

interface PeelingSectionProps {
  peeling: Peeling;
  onPeelingChange: (peeling: Peeling) => void;
}

export default function PeelingSection({ peeling, onPeelingChange }: PeelingSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-ui-fg-base">Peeling option</h3>
          <InfoPopover
            title="Peeling styles"
            description="Easy peel leaves a crack-back for quick removal. Individual cut gives each sticker its own backing for handouts."
          />
        </div>
      </div>
      <PeelingSelector selectedPeeling={peeling} onPeelingChange={onPeelingChange} />
    </div>
  );
}
