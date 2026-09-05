import React from 'react';
import { Send, ExternalLink, Phone, Mail, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function GuidanceView() {
  const { startWizard } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3B60]">
          Application Assistance & Help Desk
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
          Everything you need to know to complete your scheme application successfully
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card padding="p-6" className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#0B3B60]">
            <CheckCircle className="w-5 h-5 text-[#0F8B8D]" />
            <h3 className="font-serif text-lg font-bold">5-Step Application Process</h3>
          </div>
          <ol className="space-y-3 text-xs text-[#1C1C1C]">
            <li className="flex gap-2">
              <span className="font-bold text-[#0B3B60]">1.</span>
              <span><strong>Check Eligibility:</strong> Use ArthSetu AI to find the right loan limit.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0B3B60]">2.</span>
              <span><strong>Gather Documents:</strong> Prepare caste, income, and project proposal docs.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0B3B60]">3.</span>
              <span><strong>Visit Channel Partner:</strong> Submit documents at State SC Finance Corp / Bank.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0B3B60]">4.</span>
              <span><strong>Desk Verification:</strong> Field officer checks proposal viability.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0B3B60]">5.</span>
              <span><strong>Disbursal:</strong> Subsidized loan disbursed directly to your bank account.</span>
            </li>
          </ol>
        </Card>

        <Card padding="p-6" className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#0B3B60]">
            <HelpCircle className="w-5 h-5 text-[#C77D02]" />
            <h3 className="font-serif text-lg font-bold">Government Helplines</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0B3B60]">NSFDC Toll Free Helpline</p>
                <p className="text-[#6B7280]">1800-11-2005 (Toll Free)</p>
              </div>
              <Phone className="w-4 h-4 text-[#0F8B8D]" />
            </div>
            <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0B3B60]">Official NSFDC Portal</p>
                <p className="text-[#6B7280]">https://nsfdc.nic.in</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#0B3B60]" />
            </div>
            <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0B3B60]">MoSJE Grievance Redressal</p>
                <p className="text-[#6B7280]">pgportal.gov.in</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#0B3B60]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => startWizard(1)}
          icon={ArrowRight}
        >
          Start My Scheme Application Now
        </Button>
      </div>
    </div>
  );
}
