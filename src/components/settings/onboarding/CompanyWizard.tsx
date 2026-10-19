import React, { useState, useEffect } from 'react';
import { OnboardingFullConfig, ToastNotification } from '../../../types';
import { settingsService } from '../../../services/settingsService';
import { Step1CompanyInfo } from './Step1CompanyInfo';
import { Step2Specialties, WorkTypeId } from './Step2Specialties';
import { Step3Machines } from './Step3Machines';
import { Step4Papers } from './Step4Papers';
import { Step5ServicesAndShipping } from './Step5ServicesAndShipping';
import { OnboardingSummaryView, SummaryEditTarget } from './OnboardingSummaryView';
import { Check } from 'lucide-react';

interface CompanyWizardProps {
  onGoToQuote: () => void;
  onGoToClients?: () => void;
  clientsCount?: number;
  onShowToast: (toast: Omit<ToastNotification, 'id'>) => void;
  initialStep?: number;
  initialStep3SubStep?: 1 | 2;
  navTrigger?: number;
}

export const CompanyWizard: React.FC<CompanyWizardProps> = ({
  onGoToQuote,
  onGoToClients,
  clientsCount = 0,
  onShowToast,
  initialStep = 1,
  initialStep3SubStep = 1,
  navTrigger = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [step3SubStep, setStep3SubStep] = useState<1 | 2>(initialStep3SubStep);
  const [step4SubStep, setStep4SubStep] = useState<1 | 2>(1);
  const [returnToSummary, setReturnToSummary] = useState<boolean>(false);
  const [config, setConfig] = useState<OnboardingFullConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentStep(initialStep);
    setStep3SubStep(initialStep3SubStep);
  }, [initialStep, initialStep3SubStep, navTrigger]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await settingsService.getConfig();

        // Garantizar que la ÚNICA especialidad por defecto sea 'general' si no hay configuración previa
        const workTypes: WorkTypeId[] = (data.company.work_types && data.company.work_types.length > 0)
          ? (data.company.work_types.includes('general')
              ? (data.company.work_types as WorkTypeId[])
              : (['general', ...data.company.work_types] as WorkTypeId[]))
          : ['general'];

        // Solo inicializar selección de Bond, Couché y Opalina si todos vienen activos sin ningún gramaje configurado
        const hasAnyConfiguredGrammages = data.papers.some(
          (p) => p.grammages && p.grammages.length > 0
        );
        const hasCustomPapers = data.papers.some((p) => p.category === 'personalizado');
        let papers = data.papers;
        if (!hasCustomPapers && !hasAnyConfiguredGrammages && data.papers.every((p) => p.selected)) {
          papers = data.papers.map((p) => {
            const isTopThree =
              p.code === 'BON' ||
              p.code === 'COU' ||
              p.code === 'OPA' ||
              p.name.toLowerCase().includes('bond') ||
              p.name.toLowerCase().includes('couché') ||
              p.name.toLowerCase().includes('couche') ||
              p.name.toLowerCase().includes('opalina');
            return {
              ...p,
              selected: isTopThree,
              category: isTopThree ? ('frecuente' as const) : ('comun' as const),
            };
          });
        }

        const initializedConfig: OnboardingFullConfig = {
          ...data,
          company: {
            ...data.company,
            work_types: workTypes,
          },
          papers,
        };

        setConfig(initializedConfig);
      } catch (err) {
        console.error('Error cargando configuración:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [navTrigger]);

  const handleFinish = async () => {
    if (!config) return;
    try {
      const result = await settingsService.saveFullConfig(config);
      if (result.success) {
        onShowToast({
          type: 'success',
          message: 'Configuración guardada con éxito',
          description: 'Tu imprenta y tarifas han sido sincronizadas en la nube.',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSection = (target: SummaryEditTarget) => {
    setReturnToSummary(true);
    switch (target) {
      case 'imprenta':
        setCurrentStep(1);
        break;
      case 'trabajos':
        setCurrentStep(2);
        break;
      case 'prensas':
        setStep3SubStep(1);
        setCurrentStep(3);
        break;
      case 'sustratos': {
        const hasSelectedPapers = config?.papers?.some((p) => p.selected);
        setStep4SubStep(hasSelectedPapers ? 2 : 1);
        setCurrentStep(4);
        break;
      }
      case 'produccion':
        setStep3SubStep(2);
        setCurrentStep(3);
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#198754] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stepsMeta = [
    { num: 1, label: 'Tu imprenta' },
    { num: 2, label: 'Trabajos' },
    { num: 3, label: 'Máquinas' },
    { num: 4, label: 'Papeles' },
    { num: 5, label: 'Servicios' },
    { num: 6, label: 'Resumen' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-12 font-sans">
      {/* Stepper Progress Bar */}
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#DEE4DF] -translate-y-1/2 -z-0">
            <div
              className="h-full bg-[#198754] transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (stepsMeta.length - 1)) * 100}%`,
              }}
            />
          </div>

          {stepsMeta.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num === 3) setStep3SubStep(1);
                  setCurrentStep(s.num);
                }}
                className="flex flex-col items-center gap-1.5 z-10 bg-[#F8FAF8] px-1 cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#198754] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#0F5132] text-white ring-4 ring-[#198754]/20 shadow-xs'
                      : 'bg-white border-2 border-[#DEE4DF] text-slate-400 group-hover:border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                    isCurrent
                      ? 'text-[#0F5132]'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Components */}
      {currentStep === 1 && (
        <Step1CompanyInfo
          data={config.company}
          onChange={(updated) => {
            const updatedConfig = {
              ...config,
              company: { ...config.company, ...updated },
            };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onNext={() => {
            settingsService.saveFullConfig(config);
            if (returnToSummary) {
              setReturnToSummary(false);
              setCurrentStep(6);
            } else {
              setCurrentStep(2);
            }
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2Specialties
          selectedTypes={config.company.work_types as WorkTypeId[]}
          onChange={(types) => {
            const updatedConfig = {
              ...config,
              company: { ...config.company, work_types: types },
            };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onPrev={() => setCurrentStep(1)}
          onNext={() => {
            settingsService.saveFullConfig(config);
            if (returnToSummary) {
              setReturnToSummary(false);
              setCurrentStep(6);
            } else {
              setStep3SubStep(1);
              setCurrentStep(3);
            }
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3Machines
          machines={config.machines}
          company={config.company}
          initialSubStep={step3SubStep}
          onUpdateMachines={(machines) => {
            const updatedConfig = { ...config, machines };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onUpdateCompany={(updated) => {
            const updatedConfig = {
              ...config,
              company: { ...config.company, ...updated },
            };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onPrev={() => setCurrentStep(2)}
          onNext={() => {
            settingsService.saveFullConfig(config);
            if (returnToSummary) {
              setReturnToSummary(false);
              setCurrentStep(6);
            } else {
              setStep4SubStep(1);
              setCurrentStep(4);
            }
          }}
        />
      )}

      {currentStep === 4 && (
        <Step4Papers
          papers={config.papers}
          initialSubStep={step4SubStep}
          onUpdatePapers={(papers) => {
            const updatedConfig = { ...config, papers };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onPrev={() => {
            setStep3SubStep(2);
            setCurrentStep(3);
          }}
          onNext={(finalPapers) => {
            const updatedConfig = finalPapers
              ? { ...config, papers: finalPapers }
              : config;
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
            if (returnToSummary) {
              setReturnToSummary(false);
              setCurrentStep(6);
            } else {
              setCurrentStep(5);
            }
          }}
        />
      )}

      {currentStep === 5 && (
        <Step5ServicesAndShipping
          config={config}
          clientsCount={clientsCount}
          onUpdateServices={(services) => {
            const updatedConfig = { ...config, services };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onUpdateShippingZones={(shipping_zones) => {
            const updatedConfig = { ...config, shipping_zones };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onUpdateCompany={(updated) => {
            const updatedConfig = {
              ...config,
              company: { ...config.company, ...updated },
            };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onEditSection={handleEditSection}
          onOpenSummary={() => setCurrentStep(6)}
          onPrev={() => setCurrentStep(4)}
          onFinish={handleFinish}
          onGoToQuote={onGoToQuote}
          onGoToClients={onGoToClients}
        />
      )}

      {currentStep === 6 && (
        <OnboardingSummaryView
          config={config}
          clientsCount={clientsCount}
          onEditSection={handleEditSection}
          onUpdateCompany={(updated) => {
            const updatedConfig = {
              ...config,
              company: { ...config.company, ...updated },
            };
            setConfig(updatedConfig);
            settingsService.saveFullConfig(updatedConfig);
          }}
          onFinalize={() => {
            handleFinish();
          }}
          onGoToQuote={onGoToQuote}
          onGoToClients={onGoToClients}
        />
      )}
    </div>
  );
};

