import React, { useState, useEffect } from 'react';
import { PaperType } from '../../../types';
import { Step4PapersPart1 } from './Step4PapersPart1';
import { Step4PapersPart2 } from './Step4PapersPart2';

export { Step4PapersPart1, Step4PapersPart2 };

interface Step4Props {
  papers: PaperType[];
  initialSubStep?: 1 | 2;
  onUpdatePapers: (papers: PaperType[]) => void;
  onPrev: () => void;
  onNext: (updatedPapers?: PaperType[]) => void;
}

export const Step4Papers: React.FC<Step4Props> = ({
  papers,
  initialSubStep = 1,
  onUpdatePapers,
  onPrev,
  onNext,
}) => {
  const [subStep, setSubStep] = useState<1 | 2>(initialSubStep); // 1 = Catálogo de Papeles, 2 = Gramajes y Precios

  useEffect(() => {
    setSubStep(initialSubStep);
  }, [initialSubStep]);

  // Asegurar que por defecto únicamente Bond, Couché y Opalina estén seleccionados si ningún papel ha sido configurado aún
  useEffect(() => {
    if (!papers || papers.length === 0) return;

    const hasConfiguredGrammages = papers.some(
      (p) => p.grammages && p.grammages.length > 0
    );
    if (hasConfiguredGrammages) return;

    const activeNonFrequent = papers.filter(
      (p) => p.category === 'comun' && p.selected
    );

    if (activeNonFrequent.length > 0 && papers.every((p) => p.selected)) {
      const sanitized = papers.map((p) => {
        const isDefaultActive =
          p.code === 'BON' ||
          p.code === 'COU' ||
          p.code === 'OPA' ||
          p.name.toLowerCase().includes('bond') ||
          p.name.toLowerCase().includes('couché') ||
          p.name.toLowerCase().includes('couche') ||
          p.name.toLowerCase().includes('opalina');
        return {
          ...p,
          selected: isDefaultActive,
        };
      });
      onUpdatePapers(sanitized);
    }
  }, [papers, onUpdatePapers]);

  if (subStep === 1) {
    return (
      <Step4PapersPart1
        papers={papers}
        onUpdatePapers={onUpdatePapers}
        onPrev={onPrev}
        onNext={() => setSubStep(2)}
      />
    );
  }

  return (
    <Step4PapersPart2
      papers={papers}
      onUpdatePapers={onUpdatePapers}
      onPrev={() => setSubStep(1)}
      onNext={onNext}
    />
  );
};
