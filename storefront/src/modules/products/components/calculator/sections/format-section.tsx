'use client';

import FormatSelector from '../format-selector';
import { Format } from '../types';
import { InfoPopover } from './info-popover';

interface FormatSectionProps {
  format: Format;
  onFormatChange: (format: Format) => void;
}

export default function FormatSection({ format, onFormatChange }: FormatSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-ui-fg-base">Format</h3>
          <InfoPopover
            title="Sheets vs rolls"
            description="Sheets are easy for handing out or small runs; rolls keep labels organized for dispensers or higher volumes. Same pricing here."
          />
        </div>
      </div>
      <FormatSelector selectedFormat={format} onFormatChange={onFormatChange} />
    </div>
  );
}
