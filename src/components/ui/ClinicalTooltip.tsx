import React, { useId, useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const CLINICAL_GLOSSARY: Record<string, { title: string; explanation: string }> = {
  IJV: {
    title: 'Internal Jugular Vein (IJV)',
    explanation:
      'Primary neck vein draining blood from the brain. Microgravity fluid shifts can slow IJV flow and increase stasis or thrombosis risk.',
  },
  SANS: {
    title: 'Spaceflight Associated Neuro-ocular Syndrome',
    explanation:
      'Fluid shift toward the head in 0g can raise intracranial pressure, widening the optic nerve sheath and flattening the back of the eye.',
  },
  ONSD: {
    title: 'Optic Nerve Sheath Diameter (ONSD)',
    explanation:
      'Ultrasound measurement 3 mm behind the eye. Values ≥ 5.5 mm warn of elevated intracranial fluid pressure.',
  },
  ARED: {
    title: 'Advanced Resistive Exercise Device',
    explanation:
      'ISS vacuum-cylinder resistance machine that mimics Earth weightlifting to prevent bone density and soleus muscle loss.',
  },
  LBNP: {
    title: 'Lower Body Negative Pressure',
    explanation:
      'Gentle suction chamber around the legs that pulls stagnant upper-body fluids downward to relieve head/eye pressure.',
  },
  DONKI: {
    title: 'NASA Space Weather Database (DONKI)',
    explanation:
      'Tracks Coronal Mass Ejections (CMEs) and solar radiation storms that elevate crew radiation exposure during orbital or lunar ops.',
  },
  BMD: {
    title: 'Bone Mineral Density (BMD)',
    explanation:
      'Measure of calcium and mineral strength in load-bearing bones such as the femoral neck, lumbar spine, and heel.',
  },
  Orthostatic: {
    title: 'Orthostatic Intolerance',
    explanation:
      'Drop in blood pressure or dizziness when standing up in Earth 1.0g gravity after fluid-volume loss in space.',
  },
  APTP: {
    title: 'Astronaut Physical Therapy Protocol',
    explanation:
      'NASA Johnson Space Center 45-day phased reconditioning progression from early stabilization to full Earth clearance.',
  },
  NHIS: {
    title: 'National Health Interview Survey Baselines',
    explanation:
      'HealthData.gov reference standards used to benchmark post-flight VO2 max, 30s balance, and standing pulse stability.',
  },
};

interface ClinicalTooltipProps {
  term: keyof typeof CLINICAL_GLOSSARY | string;
  customTitle?: string;
  customExplanation?: string;
  className?: string;
}

export const ClinicalTooltip: React.FC<ClinicalTooltipProps> = ({
  term,
  customTitle,
  customExplanation,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const entry = CLINICAL_GLOSSARY[term];
  const title = customTitle ?? entry?.title ?? term;
  const explanation =
    customExplanation ??
    entry?.explanation ??
    'Spaceflight clinical reference parameter.';

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`Explain ${title}`}
        aria-describedby={open ? tooltipId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-cyan-500/40 bg-[#060f24]/95 p-3 text-left text-xs shadow-2xl backdrop-blur-xl pointer-events-none"
        >
          <span className="block font-mono text-[11px] font-bold text-cyan-300">
            {title}
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-slate-200">
            {explanation}
          </span>
        </span>
      )}
    </span>
  );
};
