import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSchemeDocuments, createApplication } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

export default function Step5Guide() {
  const { t } = useTranslation();
  const {
    formData,
    user,
    profile,
    beneficiary,
    selectedScheme,
    recommendResult,
    selectedPartner,
    setStep,
    setTrackModalOpen,
    resetAll,
    submitApplication,
  } = useApp();

  const activeScheme = selectedScheme || recommendResult?.best_match || {};
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  const schemeName = activeScheme.scheme_name || activeScheme.name || 'Micro Credit Finance';
  const schemeId = activeScheme.scheme_id || activeScheme.id || 'nsfdc-scheme';

  useEffect(() => {
    async function loadDocs() {
      setLoadingDocs(true);
      try {
        const res = await getSchemeDocuments(schemeId, schemeName);
        setDocuments(res.data.documents || []);
      } catch {
        // Fallback default checklist
        setDocuments([
          {
            id: '1',
            document_type: 'caste_certificate',
            document_name: 'Scheduled Caste (SC) Certificate',
            description: 'Issued by SDM / Tahsildar / Revenue Authority',
            is_mandatory: true,
            is_uploaded: true,
          },
          {
            id: '2',
            document_type: 'income_certificate',
            document_name: 'Annual Family Income Certificate',
            description: 'Certifying family income <= ₹3.00 Lakh',
            is_mandatory: true,
            is_uploaded: true,
          },
          {
            id: '3',
            document_type: 'aadhaar_card',
            document_name: 'Aadhaar Card (Identity Proof)',
            description: 'Government of India UIDAI Card',
            is_mandatory: true,
            is_uploaded: true,
          },
          {
            id: '4',
            document_type: 'project_report',
            document_name: 'Project Proposal / Business Plan',
            description: 'Cost breakup and anticipated revenue plan',
            is_mandatory: true,
            is_uploaded: false,
          },
        ]);
      } finally {
        setLoadingDocs(false);
      }
    }

    loadDocs();
  }, [schemeId, schemeName]);

  const toggleDocumentUpload = (docId) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_uploaded: !d.is_uploaded } : d))
    );
  };

  const handleCreateApplication = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    const payload = {
      scheme_id: schemeId,
      scheme_name: schemeName,
      partner_id: selectedPartner?.partner?.id || selectedPartner?.id,
      partner_name: selectedPartner?.partner?.name || selectedPartner?.name || 'State Channelizing Agency (SCA)',
      applicant_name: profile?.full_name || user?.user_metadata?.full_name || beneficiary?.name || 'Beneficiary Applicant',
      applicant_phone: profile?.phone || beneficiary?.phone || null,
      annual_family_income: parseFloat(formData.annual_family_income || profile?.annual_family_income || 180000),
      loan_amount: parseFloat(formData.loan_amount || 125000),
      project_cost: parseFloat(formData.project_cost || 140000),
      purpose: formData.purpose || 'business',
      sc_caste_declared: formData.sc_caste_declared !== false,
      documents: documents,
    };

    try {
      if (submitApplication) {
        const appRecord = await submitApplication(payload);
        setSubmittedApp(appRecord);
      } else {
        const res = await createApplication(payload);
        setSubmittedApp(res.data);
      }
    } catch (err) {
      console.error('Application submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State View ───────────────────────────────────────────────────
  if (submittedApp) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center max-w-xl mx-auto space-y-3 py-4">
          <div className="w-16 h-16 rounded-full bg-[#E8F7EE] text-[#1A7F4E] border-2 border-[#1A7F4E]/30 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3B60]">
            Application Successfully Registered!
          </h2>

          <div className="p-4 bg-white rounded-2xl border border-[#CBD5E1] shadow-xs inline-block text-left space-y-1.5 w-full max-w-md">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280]">Application Number:</span>
              <span className="font-mono font-bold text-base text-[#0B3B60]">
                {submittedApp.application_number}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280]">Target Scheme:</span>
              <span className="font-bold text-[#1C1C1C]">{submittedApp.scheme_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280]">Assigned Partner:</span>
              <span className="font-semibold text-[#0B3B60] text-right max-w-[200px] truncate">
                {submittedApp.partner_name}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t">
              <span className="text-[#6B7280]">Current Stage:</span>
              <StatusBadge status="potentially_eligible" text={submittedApp.status} size="xs" />
            </div>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed max-w-md mx-auto">
            Your scheme discovery packet has been forwarded to the selected Channelizing Agency branch.
          </p>

          {/* Transparent Simulation Note */}
          <div className="p-3 bg-[#FEF9E7] border border-[#B8860B]/30 rounded-xl text-[11px] text-[#8B6508] max-w-md mx-auto">
            ⚠️ <strong>Notice: </strong>
            <span>{submittedApp.demo_disclaimer}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setTrackModalOpen(true)}
              icon={FileText}
            >
              Track Live Application Status
            </Button>

            <button
              onClick={resetAll}
              className="py-3 px-5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
            >
              Start Another Discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Step 5 · Required Documents & Submission
            </span>
            <StatusBadge status="verified" text="Scheme Checklist" size="xs" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
            Complete your Application Packet
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568]">
            Prepare the required documents for verification by your State Channelizing Agency.
          </p>
        </div>

        {selectedPartner && (
          <div className="p-2.5 bg-[#EAF1F6] rounded-xl border border-[#0B3B60]/20 text-xs">
            <span className="text-[10px] text-[#6B7280] block font-semibold">Selected Agency</span>
            <strong className="text-[#0B3B60] truncate max-w-[200px] block">
              {selectedPartner.partner.name}
            </strong>
          </div>
        )}
      </div>

      {/* 1. Scheme Summary Banner */}
      <Card padding="p-5" className="bg-[#F7F9FB] border border-[#CBD5E1] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Target Scheme
            </span>
            <h3 className="font-serif text-lg font-bold text-[#0B3B60]">
              {schemeName}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#6B7280] block text-[10px]">Loan Amount</span>
              <strong className="text-[#0B3B60] font-mono">
                ₹{Number(formData.loan_amount || 125000).toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">Family Income</span>
              <strong className="text-[#0B3B60] font-mono">
                ₹{Number(formData.annual_family_income || 180000).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {selectedPartner && (
          <div className="flex items-center gap-2 text-xs text-[#4A5568]">
            <Building2 className="w-4 h-4 text-[#0F8B8D]" />
            <span>
              Application will be processed at:{' '}
              <strong className="text-[#0B3B60]">{selectedPartner.partner.name}</strong> (
              {selectedPartner.partner.city})
            </span>
          </div>
        )}
      </Card>

      {/* 2. Scheme-Specific Document Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#0B3B60] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#1A7F4E]" />
            <span>Required Documents Checklist</span>
          </h3>
          <span className="text-xs text-[#6B7280]">
            Check off documents you have ready
          </span>
        </div>

        {loadingDocs ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#6B7280]">
            Loading verified document requirements…
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => toggleDocumentUpload(doc.id)}
                className={`p-4 rounded-2xl border transition-base cursor-pointer flex items-start justify-between gap-3 ${
                  doc.is_uploaded
                    ? 'bg-[#E8F7EE] border-[#1A7F4E]/40 shadow-2xs'
                    : 'bg-white border-[#E5E7EB] hover:border-[#0B3B60]/30'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-base ${
                      doc.is_uploaded
                        ? 'border-[#1A7F4E] bg-[#1A7F4E] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {doc.is_uploaded && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs sm:text-sm text-[#1C1C1C]">
                        {doc.document_name}
                      </p>
                      {doc.is_mandatory && (
                        <span className="text-[10px] font-bold text-[#B3261E] bg-[#FDF2F2] px-1.5 py-0.5 rounded">
                          Mandatory
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-[11px] text-[#6B7280] leading-snug">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                      doc.is_uploaded
                        ? 'text-[#1A7F4E] bg-white border border-[#1A7F4E]/30'
                        : 'text-gray-500 bg-gray-100'
                    }`}
                  >
                    {doc.is_uploaded ? '✓ Ready' : 'Attach'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Transparent Disclaimer Note */}
      <div className="p-4 bg-[#FEF9E7] border border-[#B8860B]/30 rounded-2xl text-xs text-[#8B6508] space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
          <span>Beneficiary Advisory</span>
        </p>
        <p className="text-[11px] text-[#8B6508]/90 leading-relaxed">
          ArthSetu organizes and matches government scheme eligibility. No original documents are retained. Final physical verification will be conducted by your local State Channelizing Agency officer.
        </p>
      </div>

      {/* Submit Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="text-xs font-semibold text-[#6B7280] hover:text-[#0B3B60] transition-base cursor-pointer"
        >
          ← Back to Partner Agency Map
        </button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={submitting}
          onClick={handleCreateApplication}
          icon={Sparkles}
        >
          Submit Scheme Application →
        </Button>
      </div>
    </div>
  );
}
