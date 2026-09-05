import React from 'react';
import { Scale, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { POPULAR_SCHEMES_DATA } from '../components/PopularSchemes';
import Card from '../components/Card';

export default function CompareView() {
  const { startWizard } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3B60]">
          Compare Government Schemes
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
          Side-by-side comparison of interest rates, loan ceilings, and repayment terms
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B3B60] text-white">
            <tr>
              <th className="p-4 font-semibold w-1/4">Feature</th>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <th key={s.id} className="p-4 font-semibold min-w-[200px]">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Category</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4">{s.category}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Max Loan Ceiling</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4 font-bold font-mono text-[#0B3B60] text-sm">
                  {s.maxAmount}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Interest Rate (p.a.)</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4 font-bold font-mono text-[#1A7F4E] text-sm">
                  {s.rate}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">NSFDC Financing Share</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4">{s.financing}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Max Repayment Tenure</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4">{s.tenure}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Moratorium Period</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4">{s.moratorium}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold bg-[#F7F9FB] text-[#0B3B60]">Apply & Check</td>
              {POPULAR_SCHEMES_DATA.map((s) => (
                <td key={s.id} className="p-4">
                  <button
                    onClick={() =>
                      startWizard(1, { project_type: s.projectType, project_cost: s.prefillCost })
                    }
                    className="w-full py-2 px-3 bg-[#0B3B60] hover:bg-[#07263F] text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                  >
                    Select Scheme
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
