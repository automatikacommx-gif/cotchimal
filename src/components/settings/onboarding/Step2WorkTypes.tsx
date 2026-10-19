import React from 'react';
import { Step2Specialties, WorkTypeId } from './Step2Specialties';

export { Step2Specialties };

interface Step2Props {
  selectedTypes: ('general' | 'editorial' | 'empaque' | 'gran_formato')[];
  onChange: (types: ('general' | 'editorial' | 'empaque' | 'gran_formato')[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step2WorkTypes: React.FC<Step2Props> = ({
  selectedTypes,
  onChange,
  onPrev,
  onNext,
}) => {
  return (
    <Step2Specialties
      selectedTypes={selectedTypes as WorkTypeId[]}
      onChange={onChange as (types: WorkTypeId[]) => void}
      onPrev={onPrev}
      onNext={onNext}
    />
  );
};

