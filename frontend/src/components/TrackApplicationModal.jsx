import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
  ShieldCheck,
  AlertCircle,
  Building2,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { trackApplication, updateApplicationStatus } from '../api';

const STAGE_ORDER = [
  'Submitted',
  'Under Review',
  'Documents Required',
  'Forwarded to Partner',
  'Processing',
  'Decision',
];

export default function TrackApplicationModal({ isOpen, onClose }) {
  const [appId, setAppId] = useState('ARTH-2024-88421');
  const [trackedData, setTrackedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoUpdating, setDemoUpdating] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!appId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await trackApplication(appId.trim());
      setTrackedData(res.data);
    } catch (err) {
      console.warn('Track application error:', err);
      setError('Application ID not found. Try demo ID: ARTH-2024-88421');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateStatus = async (nextStatus) => {
    if (!trackedData) return;
    setDemoUpdating(true);
    try {
      const res = await updateApplicationStatus(trackedData.application_number, {
        new_status: nextStatus,
        remarks: `Stage advanced to '${nextStatus}' during live evaluation demonstration.`,
        updated_by: 'State Channelizing Agency Officer',
      });
      setTrackedData(res.data);
    } catch (err) {
      console.error('Status simulation error:', err);
    } finally {
      setDemoUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-w-[calc(100vw-24px)] p-5 sm:p-6 shadow-2xl border border-[#E5E7EB] relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-[#6B7280] hover:text-[#1C1C1C] p-2 rounded-lg hover:bg-gray-100 transition-base cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60]/20 flex items-center justify-center mx-auto mb-2.5">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B3B60]">
            Track Application Journey
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time status across State Channelizing Agencies & Partner Banks
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-1">
              Application ID / Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. ARTH-2024-88421 or 9876543210"
                className="w-full h-11 pl-3.5 pr-10 border border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10 bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => {
                  setAppId('ARTH-2024-88421');
                  handleTrack();
                }}
                className="font-mono font-bold text-[#0B3B60] underline cursor-pointer"
              >
                ARTH-2024-88421
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={Search}
            >
              Track Application
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 bg-[#FDF2F2] border border-[#B3261E]/30 rounded-xl text-xs text-[#B3261E] flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details & Timeline View */}
        {trackedData && (
          <div className="space-y-5 pt-4 border-t border-[#E5E7EB] animate-in fade-in duration-200">
            {/* Application Overview Card */}
            <div className="p-4 bg-[#F7F9FB] rounded-2xl border border-[#CBD5E1] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase block">
                    Application ID
                  </span>
                  <span className="font-mono font-bold text-base text-[#0B3B60]">
                    {trackedData.application_number}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">Current Stage:</span>
                  <StatusBadge
                    status="potentially_eligible"
                    text={trackedData.status}
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                <div>
                  <span className="text-[#6B7280] block text-[10px]">Scheme:</span>
                  <strong className="text-[#1C1C1C]">{trackedData.scheme_name}</strong>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10px]">Applicant:</span>
                  <strong className="text-[#1C1C1C]">{trackedData.applicant_name}</strong>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10px]">Assigned Partner:</span>
                  <strong className="text-[#0B3B60] truncate block">
                    {trackedData.partner_name || 'State Channelizing Agency'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Stages Stepper Progress Indicator */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider block">
                Official Stage Progress
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                {STAGE_ORDER.map((stageName, idx) => {
                  const currentIdx = STAGE_ORDER.indexOf(trackedData.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stageName}
                      className={`p-2 rounded-xl text-[10px] font-bold transition-base ${
                        isDone
                          ? 'bg-[#E8F7EE] text-[#1A7F4E] border border-[#1A7F4E]/30'
                          : isCurrent
                          ? 'bg-[#0B3B60] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <div className="mb-0.5">
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="leading-tight block truncate">{stageName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Audit History */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider block">
                Audit Timeline History
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-[#CBD5E1] ml-2">
                {trackedData.timeline &&
                  trackedData.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#0B3B60] border-2 border-white ring-2 ring-[#CBD5E1]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0B3B60]">
                          {item.to_status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A5568] leading-snug">
                        {item.remarks}
                      </p>
                      <span className="text-[10px] text-[#6B7280] block font-medium">
                        By: {item.updated_by}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Hackathon Demo Simulation Controls */}
            <div className="p-4 bg-[#EAF1F6]/70 rounded-2xl border border-[#0B3B60]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B3B60] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C77D02]" />
                  <span>Interactive Demonstration Controls (Hackathon Simulation)</span>
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  Advance stages in real-time
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {STAGE_ORDER.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    disabled={demoUpdating || trackedData.status === stage}
                    onClick={() => handleSimulateStatus(stage)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-base cursor-pointer ${
                      trackedData.status === stage
                        ? 'bg-[#0B3B60] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Set to: {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Simulation Disclaimer */}
            <div className="p-3 bg-[#FEF9E7] border border-[#B8860B]/30 rounded-xl text-[11px] text-[#8B6508]">
              ⚠️ <strong>Notice: </strong>
              <span>Demo status simulation — not connected to NSFDC's live systems.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
