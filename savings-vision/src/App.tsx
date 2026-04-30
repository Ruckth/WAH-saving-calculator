import { Header } from './components/ui/Header';
import { ScamWarning } from './components/sections/ScamWarning';
import { JobsSection } from './components/sections/JobsSection';
import { LifestyleSection } from './components/sections/LifestyleSection';
import { GoalSection } from './components/sections/GoalSection';
import { WorkWeeksSection } from './components/sections/WorkWeeksSection';
import { ResultCard } from './components/results/ResultCard';
import { TipCreatorSection } from './components/sections/TipCreatorSection';
import { ResourcesSection } from './components/sections/ResourcesSection';
import { TipCreatorModal } from './components/sections/TipCreatorModal';
import { t } from './i18n';
import { useCalculatorState } from './hooks/useCalculatorState';

export default function App() {
  const { state, derived, actions } = useCalculatorState();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header lang={state.lang} onToggleLang={actions.toggleLang} />

      <main className="mx-auto max-w-2xl space-y-3 px-3 pb-16 pt-2 sm:space-y-4 sm:px-4 sm:pb-20">
        {!state.scamBannerDismissed && (
          <ScamWarning lang={state.lang} onDismiss={actions.dismissScamBanner} />
        )}

        <JobsSection
          lang={state.lang}
          jobs={state.jobs}
          totalHoursPerWeek={derived.totalHoursPerWeek}
          totalWeeklyGrossIncome={derived.totalWeeklyGrossIncome}
          hoursOverSoftLimit={derived.hoursOverSoftLimit}
          onPickJob={actions.pickJob}
          onPickExperience={actions.pickExperience}
          onSetJobHourlyWage={actions.setJobHourlyWage}
          onSetJobHours={actions.setJobHours}
          onAddJob={actions.addJob}
          onRemoveJob={actions.removeJob}
        />

        <LifestyleSection
          lang={state.lang}
          lifestyleId={state.lifestyleId}
          tier={derived.tier}
          expenses={state.expenses}
          totalExpenses={derived.totalExpenses}
          safeRate={derived.safeRate}
          weeklyRemittance={state.weeklyRemittance}
          remittanceCurrency={state.remittanceCurrency}
          remittanceInAUD={derived.remittanceInAUD}
          onPickLifestyle={actions.pickLifestyle}
          onUpdateExpense={actions.updateExpense}
          onSetWeeklyRemittance={actions.setWeeklyRemittance}
          onSwitchRemittanceCurrency={actions.switchRemittanceCurrency}
        />

        <GoalSection
          lang={state.lang}
          goalAmount={state.goalAmount}
          goalCurrency={state.goalCurrency}
          goalInAUD={derived.goalInAUD}
          safeRate={derived.safeRate}
          thbPerAud={state.thbPerAud}
          rateMeta={state.rateMeta}
          startDateISO={state.startDateISO}
          onSetGoalAmount={actions.setGoalAmount}
          onSwitchGoalCurrency={actions.switchGoalCurrency}
          onSetThbPerAudManual={actions.setThbPerAudManual}
          onSetStartDateISO={actions.setStartDateISO}
        />

        <WorkWeeksSection
          lang={state.lang}
          workWeeksPerYear={state.workWeeksPerYear}
          onSetWorkWeeksPerYear={actions.setWorkWeeksPerYear}
        />

        <ResultCard
          result={derived.result}
          lang={state.lang}
          goalAmount={derived.goalInAUD}
          thbPerAud={derived.safeRate}
          startDateISO={state.startDateISO}
          workWeeksPerYear={state.workWeeksPerYear}
        />

        <TipCreatorSection lang={state.lang} onOpen={actions.openTipModal} />
        <ResourcesSection lang={state.lang} />

        <p className="pt-4 text-center text-xs leading-relaxed text-stone-400">
          {t(state.lang, 'footer_note')}
        </p>
      </main>

      <TipCreatorModal
        lang={state.lang}
        open={state.tipModalOpen}
        thanking={state.tipThankYou}
        onClose={actions.closeTipModal}
        onDismiss={actions.dismissTipModalImmediately}
        onDownload={actions.downloadTipQr}
      />
    </div>
  );
}
