import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Circle,
  FileCheck2,
  Building2,
  FileText,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TrackingView() {
  const { navigateTo, startJourney, userApplications = [] } = useApp();
  const [selectedAppIndex, setSelectedAppIndex] = useState(0);

  const STAGES = [
    { key: 'Submitted', label: 'Application Submitted', desc: 'Application packet registered on ArthSetu.' },
    { key: 'Under Review', label: 'Under Review', desc: 'SCA / Bank reviewing preliminary documents.' },
    { key: 'Documents Required', label: 'Documents Required', desc: 'Additional verification or certificates required.' },
    { key: 'Forwarded to Partner', label: 'Forwarded to Partner Bank', desc: 'Docket forwarded to lead branch desk.' },
    { key: 'Processing', label: 'Processing & Field Inspection', desc: 'Credit assessment and inspection in progress.' },
    { key: 'Decision', label: 'Sanction / Decision', desc: 'Final loan sanction letter & disbursement.' },
  ];

  if (userApplications.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
              No applications yet
            </h3>
            <p className="text-xs text-[#64748B]">
              You have not submitted any NSFDC scheme applications under this account yet.
            </p>
          </div>
          <button
            onClick={() => startJourney(1)}
            className="px-6 py-2.5 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs sm:text-sm shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start My Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const activeApp = userApplications[selectedAppIndex] || userApplications[0];

  // Helper to determine stage status
  const getStageStatus = (stageKey) => {
    const stageOrder = ['Submitted', 'Under Review', 'Documents Required', 'Forwarded to Partner', 'Processing', 'Decision'];
    const currentIdx = stageOrder.indexOf(activeApp.status);
    const thisIdx = stageOrder.indexOf(stageKey);

    if (thisIdx < currentIdx) return 'completed';
    if (thisIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <span className="text-xs font-bold text-[#0E6655] bg-[#E8F8F2] px-3 py-1.5 rounded-full border border-[#10B981]/30">
          {userApplications.length} Application{userApplications.length > 1 ? 's' : ''} on Record
        </span>
      </div>

      {/* Selector if multiple applications */}
      {userApplications.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {userApplications.map((app, idx) => (
            <button
              key={app.id}
              onClick={() => setSelectedAppIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[40px] flex items-center shrink-0 ${
                idx === selectedAppIndex
                  ? 'bg-[#0B3B60] text-white'
                  : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
              }`}
            >
              {app.scheme_name} ({app.application_number})
            </button>
          ))}
        </div>
      )}

      {/* Application Summary Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Application ID
            </span>
            <span className="font-mono text-base font-bold text-[#0B3B60]">
              {activeApp.application_number}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Scheme
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
              {activeApp.scheme_name}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Partner: {activeApp.partner_name || 'Channelizing Agency'}
            </span>
          </div>
        </div>

        {/* Current Status Highlight Banner */}
        <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Current Status</span>
              <span className="text-xs font-bold text-[#0B3B60]">{activeApp.status}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(activeApp.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Vertical Audit Timeline */}
        <div className="space-y-6 relative pl-2 pt-2">
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.key);
            const isDone = status === 'completed';
            const isActive = status === 'active';
            const isPending = status === 'pending';
            const isLast = idx === STAGES.length - 1;

            return (
              <div key={stage.key} className="relative flex items-start gap-4">
                {/* Connecting vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-[13px] top-[26px] bottom-[-22px] w-[2px] ${
                      isDone ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}

                {/* Node Icon */}
                <div className="relative z-10 shrink-0">
                  {isDone && (
                    <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {isActive && (
                    <div className="w-7 h-7 rounded-full bg-white border-[3px] border-[#0B3B60] flex items-center justify-center shadow-xs ring-4 ring-[#0B3B60]/15">
                      <div className="w-2 h-2 rounded-full bg-[#0B3B60]" />
                    </div>
                  )}

                  {isPending && (
                    <div className="w-7 h-7 rounded-full bg-[#F8FAFC] border-2 border-[#CBD5E1] flex items-center justify-center" />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 space-y-0.5 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isActive
                          ? 'text-[#0B3B60]'
                          : isDone
                          ? 'text-[#1E293B]'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {stage.label}
                    </h4>

                    {isActive && (
                      <span className="text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2 py-0.5 rounded-full border border-[#10B981]/30">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B]">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
