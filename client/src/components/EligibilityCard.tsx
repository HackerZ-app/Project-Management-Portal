import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';
import eligibilityService from '../services/eligibility.service';
import { EligibilityResponse, CourseEvaluation } from '../types/eligibility.types';

export const EligibilityCard: React.FC = () => {
  const [data, setData] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('Capstone Project');
  const [error, setError] = useState<string | null>(null);

  const fetchEligibility = async (force: boolean = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await eligibilityService.checkEligibility(force);
      setData(response);

      // Select first available course type if current selection not found
      if (response.evaluations && !response.evaluations[selectedCourse]) {
        const firstKey = Object.keys(response.evaluations)[0];
        if (firstKey) setSelectedCourse(firstKey);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Unable to evaluate project eligibility at this time.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEligibility(false);
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4" />
        <div className="h-20 bg-slate-900/60 rounded-xl mb-4" />
        <div className="h-32 bg-slate-900/60 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-red-500/30 bg-red-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Eligibility System Offline</h3>
          </div>
          <button
            onClick={() => fetchEligibility(true)}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            Retry
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">{error}</p>
      </div>
    );
  }

  const currentEval: CourseEvaluation | undefined = data.evaluations[selectedCourse];

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              data.isEligible
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {data.isEligible ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Project Eligibility Standing</h2>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  data.isEligible
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {data.isEligible ? 'Eligible to Apply' : 'Requirements Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated evaluation against SRM AP departmental criteria ({data.studentAcademicSummary.department})
            </p>
          </div>
        </div>

        {/* Cache / Refresh Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">
            {data.source === 'cache' ? '⚡ Cached Record' : '🔄 Freshly Computed'}
          </span>
          <button
            onClick={() => fetchEligibility(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Re-evaluate eligibility"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Recheck</span>
          </button>
        </div>
      </div>

      {/* Course Type Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 border-b border-slate-800/80">
        {Object.keys(data.evaluations).map((courseName) => {
          const evalItem = data.evaluations[courseName];
          const isSelected = selectedCourse === courseName;

          return (
            <button
              key={courseName}
              onClick={() => setSelectedCourse(courseName)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {evalItem.isEligible ? (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
              ) : (
                <XCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
              )}
              <span>{courseName}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Course Evaluation Breakdown */}
      {currentEval && (
        <div className="space-y-4">
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
              currentEval.isEligible
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            }`}
          >
            {currentEval.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-semibold">
                {currentEval.isEligible
                  ? `You satisfy all departmental requirements for ${selectedCourse}.`
                  : `You are currently not eligible for ${selectedCourse}.`}
              </span>
              {!currentEval.isEligible && currentEval.failureReasons.length > 0 && (
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90">
                  {currentEval.failureReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 4-Pillar Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. CGPA Metric */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Min CGPA
                </span>
                {currentEval.checks.cgpa.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentEval.checks.cgpa.actual.toFixed(2)}
                </span>
                <span className="text-slate-500 text-[11px]">
                  / req. {currentEval.criteria.minCgpa.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Semester Requirement */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Semester
                </span>
                {currentEval.checks.semester.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  Sem {currentEval.checks.semester.actual}
                </span>
                <span className="text-slate-500 text-[11px]">
                  / min. Sem {currentEval.criteria.minSemester}
                </span>
              </div>
            </div>

            {/* 3. Disciplinary Record */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Conduct Record
                </span>
                {currentEval.checks.disciplinary.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <span className="text-sm font-semibold text-white">
                {data.studentAcademicSummary.hasDisciplinaryAction ? (
                  <span className="text-red-400">Action Pending</span>
                ) : (
                  <span className="text-emerald-400">Clean Standing</span>
                )}
              </span>
            </div>

            {/* 4. Prerequisites */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Prerequisites
                </span>
                {currentEval.checks.prerequisites.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {currentEval.criteria.requiredPrerequisites.length > 0
                  ? currentEval.criteria.requiredPrerequisites.join(', ')
                  : 'None Required'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
