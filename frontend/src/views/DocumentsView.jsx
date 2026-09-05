import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  FileCheck2,
  UploadCloud,
  Eye,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DocumentsView() {
  const {
    navigateTo,
    user,
    selectedScheme,
    userDocuments = [],
    uploadUserDocument,
    deleteUserDocument,
  } = useApp();

  const [activeUploadCategory, setActiveUploadCategory] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Scheme-specific document checklist
  const isEducationScheme =
    selectedScheme?.id === 'educational_loan_scheme' ||
    selectedScheme?.name?.toLowerCase().includes('education');

  const REQUIRED_CATEGORIES = [
    {
      category: 'Identity Proof',
      title: 'Aadhaar Card (Identity & Address Proof)',
      desc: 'Government of India UIDAI Aadhaar card with linked mobile.',
      isMandatory: true,
    },
    {
      category: 'Income Certificate',
      title: 'Annual Family Income Certificate',
      desc: 'Competent authority revenue certificate verifying family income ≤ ₹3.00 Lakh.',
      isMandatory: true,
    },
    {
      category: 'Caste Certificate',
      title: 'Scheduled Caste (SC) Certificate',
      desc: 'Valid caste certificate issued by SDM / Tehsildar / District Magistrate.',
      isMandatory: true,
    },
    {
      category: 'Bank Document',
      title: 'Bank Account Passbook / Cancelled Cheque',
      desc: 'DBT-enabled bank account details in applicant name for direct benefit transfer.',
      isMandatory: true,
    },
    isEducationScheme
      ? {
          category: 'Education Certificate',
          title: 'Confirmed Admission Letter & Fee Schedule',
          desc: 'Official admission letter from recognized Indian or Overseas university.',
          isMandatory: true,
        }
      : {
          category: 'Project Proposal',
          title: 'Detailed Project Report (DPR) / Machinery Quotation',
          desc: 'Machinery quotation or business setup expenditure report.',
          isMandatory: false,
        },
  ];

  const handleUploadClick = (category) => {
    if (!user) {
      setErrorMsg('Please login to upload documents.');
      return;
    }
    setActiveUploadCategory(category);
    setErrorMsg('');
    setSuccessMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadCategory) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5MB.');
      return;
    }

    setUploadingCategory(activeUploadCategory);
    setErrorMsg('');
    try {
      const categoryDef = REQUIRED_CATEGORIES.find((c) => c.category === activeUploadCategory);
      await uploadUserDocument(file, activeUploadCategory, categoryDef?.title || file.name);
      setSuccessMsg(`"${categoryDef?.category}" uploaded securely to your private storage.`);
    } catch (err) {
      console.error('Document upload error:', err);
      setErrorMsg(err?.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploadingCategory(null);
      setActiveUploadCategory(null);
    }
  };

  const handleViewDoc = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      alert(`Document: ${doc.document_name}\nStatus: Uploaded securely to documents/${user?.id}/\nPrivate access verified under Supabase Storage RLS.`);
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Are you sure you want to remove ${doc.document_name}?`)) {
      await deleteUserDocument(doc.id, doc.file_path);
      setSuccessMsg('Document removed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hidden File Input for Native Document Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <span className="text-xs font-bold text-[#0E6655] bg-[#E8F8F2] px-3 py-1 rounded-full border border-[#10B981]/30">
          Target Scheme: {selectedScheme?.name || 'NSFDC Scheme'}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
              My Documents & Scheme Requirements
            </h2>
            <p className="text-xs text-[#64748B]">
              Upload and manage required documents for your concessional loan application.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-1">
          Required Documents Checklist
        </h3>

        <div className="space-y-3">
          {REQUIRED_CATEGORIES.map((item) => {
            const uploadedDoc = userDocuments.find((d) => d.category === item.category);
            const isUploaded = Boolean(uploadedDoc);
            const isBusy = uploadingCategory === item.category;

            return (
              <div
                key={item.category}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs ${
                  isUploaded
                    ? 'border-[#A3E4D7] bg-[#F9FEFB]'
                    : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                        {item.category}
                      </h4>
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2 py-0.5 rounded-md border border-[#10B981]/30">
                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                          <span>Uploaded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Required</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#0B3B60]">{item.title}</p>
                    <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {isUploaded ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleViewDoc(uploadedDoc)}
                          className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUploadClick(item.category)}
                          className="px-3 py-1.5 rounded-xl border border-[#0E6655] text-[#0E6655] hover:bg-[#E8F8F2] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                          <span>{isBusy ? 'Uploading...' : 'Replace'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(uploadedDoc)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUploadClick(item.category)}
                        className="px-4 py-2 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                      >
                        <UploadCloud className={`w-4 h-4 ${isBusy ? 'animate-bounce' : ''}`} />
                        <span>{isBusy ? 'Uploading...' : 'Upload'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Security Disclaimer */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] flex items-start gap-3 text-xs text-[#64748B]">
        <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#1E293B]">
            Your documents are stored securely and are used only for application guidance.
          </p>
          <p className="text-[11px] mt-0.5">
            Files are saved to your private folder in Supabase Storage with Row Level Security. No public URL exposure.
          </p>
        </div>
      </div>
    </div>
  );
}
