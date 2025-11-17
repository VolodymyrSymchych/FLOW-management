'use client';

import { useState, ReactNode, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Step {
  /** Unique identifier for the step */
  id: string;
  /** Step title */
  title: string;
  /** Optional description */
  description?: string;
  /** Step content */
  content: ReactNode;
  /** Optional validation function */
  validate?: () => boolean | Promise<boolean>;
  /** Optional icon */
  icon?: ReactNode;
}

interface MultiStepFormProps {
  /** Array of steps */
  steps: Step[];
  /** Called when form is completed */
  onComplete: () => void | Promise<void>;
  /** Called when form is cancelled */
  onCancel?: () => void;
  /** Current step index (controlled) */
  currentStep?: number;
  /** Called when step changes (controlled) */
  onStepChange?: (step: number) => void;
  /** Show progress bar (default: true) */
  showProgress?: boolean;
  /** Allow skipping steps (default: false) */
  allowSkip?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom button labels */
  labels?: {
    next?: string;
    previous?: string;
    complete?: string;
    skip?: string;
  };
}

/**
 * Multi-step Form component
 *
 * Features:
 * - Step-by-step navigation
 * - Progress indicator
 * - Validation per step
 * - Controlled/Uncontrolled modes
 * - Skip functionality
 * - Keyboard navigation
 * - ARIA compliant
 * - Glassmorphism styling
 *
 * @example
 * const steps = [
 *   {
 *     id: 'personal',
 *     title: 'Personal Info',
 *     content: <PersonalInfoForm />,
 *     validate: () => validatePersonalInfo()
 *   },
 *   {
 *     id: 'business',
 *     title: 'Business Details',
 *     content: <BusinessForm />
 *   }
 * ];
 *
 * <MultiStepForm
 *   steps={steps}
 *   onComplete={handleComplete}
 * />
 */
export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  currentStep: controlledStep,
  onStepChange,
  showProgress = true,
  allowSkip = false,
  loading = false,
  labels = {},
}: MultiStepFormProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validating, setValidating] = useState(false);

  const currentStepIndex = controlledStep ?? internalStep;
  const isControlled = controlledStep !== undefined;

  const setCurrentStep = (step: number) => {
    if (isControlled) {
      onStepChange?.(step);
    } else {
      setInternalStep(step);
    }
  };

  const currentStepData = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && !isFirstStep) {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === 'ArrowRight' && !isLastStep) {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [currentStepIndex]);

  const handleNext = async () => {
    // Validate current step if validation function exists
    if (currentStepData.validate) {
      setValidating(true);
      try {
        const isValid = await currentStepData.validate();
        if (!isValid) {
          setValidating(false);
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidating(false);
        return;
      }
      setValidating(false);
    }

    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

    // Move to next step or complete
    if (isLastStep) {
      await onComplete();
    } else {
      setCurrentStep(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep && allowSkip) {
      setCurrentStep(currentStepIndex + 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Only allow going to completed steps or next step
    if (completedSteps.has(stepIndex) || stepIndex === currentStepIndex + 1) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStepIndex;
              const isClickable = isCompleted || index === currentStepIndex + 1;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <button
                    onClick={() => goToStep(index)}
                    disabled={!isClickable}
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-full transition-all',
                      isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      isCompleted && 'bg-success text-white',
                      !isCompleted && !isCurrent && 'glass-medium text-text-tertiary',
                      !isCompleted && isCurrent && 'glass-strong text-primary',
                      isClickable && 'cursor-pointer hover:scale-110',
                      !isClickable && 'cursor-not-allowed opacity-50'
                    )}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 transition-colors',
                        isCompleted ? 'bg-success' : 'glass-subtle'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 glass-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Step Title */}
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-text-primary">
              {currentStepData.title}
            </h2>
            {currentStepData.description && (
              <p className="text-sm text-text-secondary mt-1">
                {currentStepData.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div
        className="glass-medium rounded-xl p-6 border border-white/10 mb-6 min-h-[400px]"
        role="region"
        aria-label={`Step ${currentStepIndex + 1} of ${steps.length}`}
      >
        {currentStepData.content}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              variant="ghost"
              onClick={handlePrevious}
              icon={<ChevronLeft className="w-4 h-4" />}
              disabled={loading || validating}
            >
              {labels.previous || 'Previous'}
            </Button>
          )}

          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={loading || validating}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {allowSkip && !isLastStep && (
            <Button variant="ghost" onClick={handleSkip} disabled={loading || validating}>
              {labels.skip || 'Skip'}
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            loading={loading || validating}
            icon={!isLastStep ? <ChevronRight className="w-4 h-4" /> : undefined}
            iconPosition="right"
          >
            {isLastStep ? labels.complete || 'Complete' : labels.next || 'Next'}
          </Button>
        </div>
      </div>

      {/* Keyboard Hint */}
      <p className="text-xs text-text-tertiary text-center mt-4">
        Tip: Use Alt + Arrow keys to navigate between steps
      </p>
    </div>
  );
}

/**
 * Example usage:
 *
 * function ProjectCreationWizard() {
 *   const [formData, setFormData] = useState({
 *     name: '',
 *     description: '',
 *     team: [],
 *     budget: 0
 *   });
 *
 *   const steps: Step[] = [
 *     {
 *       id: 'basic',
 *       title: 'Basic Information',
 *       description: 'Enter project name and description',
 *       content: (
 *         <BasicInfoForm
 *           data={formData}
 *           onChange={(data) => setFormData({ ...formData, ...data })}
 *         />
 *       ),
 *       validate: () => formData.name.length > 0
 *     },
 *     {
 *       id: 'team',
 *       title: 'Team Members',
 *       description: 'Add team members to the project',
 *       content: (
 *         <TeamSelection
 *           selected={formData.team}
 *           onChange={(team) => setFormData({ ...formData, team })}
 *         />
 *       )
 *     },
 *     {
 *       id: 'budget',
 *       title: 'Budget & Timeline',
 *       content: <BudgetForm data={formData} onChange={setFormData} />
 *     }
 *   ];
 *
 *   return (
 *     <MultiStepForm
 *       steps={steps}
 *       onComplete={async () => {
 *         await createProject(formData);
 *       }}
 *       onCancel={() => router.push('/projects')}
 *     />
 *   );
 * }
 */
