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
      <div className="p-6 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
        <div className="h-20 bg-slate-100 rounded-xl mb-4" />
        <div className="h-32 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-50 border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Eligibility System Offline</h3>
          </div>
          <button
            onClick={() => fetchEligibility(true)}
            className="text-xs px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium"
          >
            Retry
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">{error}</p>
      </div>
    );
  }

  const currentEval: CourseEvaluation | undefined = data.evaluations[selectedCourse];

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              data.isEligible
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-yellow-50 border-yellow-200 text-yellow-600'
            }`}
          >
            {data.isEligible ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Project Eligibility Standing</h2>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                  data.isEligible
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}
              >
                {data.isEligible ? 'Eligible to Apply' : 'Requirements Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated evaluation against SRM AP departmental criteria ({data.studentAcademicSummary.department})
            </p>
          </div>
        </div>

        {/* Cache / Refresh Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-500 font-medium">
            {data.source === 'cache' ? '⚡ Cached Record' : '🔄 Freshly Computed'}
          </span>
          <button
            onClick={() => fetchEligibility(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all disabled:opacity-50 shadow-sm"
            title="Re-evaluate eligibility"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Recheck</span>
          </button>
        </div>
      </div>

      {/* Course Type Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 border-b border-slate-100">
        {Object.keys(data.evaluations).map((courseName) => {
          const evalItem = data.evaluations[courseName];
          const isSelected = selectedCourse === courseName;

          return (
            <button
              key={courseName}
              onClick={() => setSelectedCourse(courseName)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {evalItem.isEligible ? (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-green-600'}`} />
              ) : (
                <XCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-yellow-600'}`} />
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
            className={`p-3.5 rounded-md border flex items-center gap-3 text-xs ${
              currentEval.isEligible
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}
          >
            {currentEval.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-semibold">
                {currentEval.isEligible
                  ? `You satisfy all departmental requirements for ${selectedCourse}.`
                  : `You are currently not eligible for ${selectedCourse}.`}
              </span>
              {!currentEval.isEligible && currentEval.failureReasons.length > 0 && (
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px] text-yellow-800">
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
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Min CGPA
                </span>
                {currentEval.checks.cgpa.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  {currentEval.checks.cgpa.actual.toFixed(2)}
                </span>
                <span className="text-slate-500 text-[11px]">
                  / req. {currentEval.criteria.minCgpa.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Semester Requirement */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Semester
                </span>
                {currentEval.checks.semester.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900">
                  Sem {currentEval.checks.semester.actual}
                </span>
                <span className="text-slate-500 text-[11px]">
                  / min. Sem {currentEval.criteria.minSemester}
                </span>
              </div>
            </div>

            {/* 3. Disciplinary Record */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Conduct Record
                </span>
                {currentEval.checks.disciplinary.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {data.studentAcademicSummary.hasDisciplinaryAction ? (
                  <span className="text-red-600">Action Pending</span>
                ) : (
                  <span className="text-green-600">Clean Standing</span>
                )}
              </span>
            </div>

            {/* 4. Prerequisites */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Prerequisites
                </span>
                {currentEval.checks.prerequisites.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="text-[11px] text-slate-700 truncate">
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
