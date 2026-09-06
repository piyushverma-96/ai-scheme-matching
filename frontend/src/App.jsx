import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AiAssistantModal from './components/AiAssistantModal';
import OnboardingModal from './views/OnboardingModal';

// Views matching the mockup
import HomeView from './views/HomeView';
import ProductJourneyContainer from './views/journey/ProductJourneyContainer';
import SchemesCatalogView from './views/SchemesCatalogView';
import SchemeDetailsView from './views/SchemeDetailsView';
import EligibilityResultView from './views/EligibilityResultView';
import CalculatorView from './views/CalculatorView';
import PartnersView from './views/PartnersView';
import TrackingView from './views/TrackingView';
import DocumentsView from './views/DocumentsView';
import AiAssistantView from './views/AiAssistantView';
import ProfileView from './views/ProfileView';
import HelpTrustView from './views/HelpTrustView';
import LoginView from './views/LoginView';
import AdminDashboardView from './views/AdminDashboardView';

import CompleteProfileModal from './views/CompleteProfileModal';

import useWindowDimensions from './hooks/useWindowDimensions';

export default function App() {
  const { currentView, navigateTo, completeProfileOpen, setCompleteProfileOpen } = useApp();
  const { isMobile, isTablet, isDesktop } = useWindowDimensions();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'journey':
      case 'wizard':
      case 'find_scheme':
        return <ProductJourneyContainer />;
      case 'schemes':
        return <SchemesCatalogView />;
      case 'scheme_details':
        return <SchemeDetailsView />;
      case 'eligibility_result':
      case 'eligibility':
        return <EligibilityResultView />;
      case 'calculator':
        return <CalculatorView />;
      case 'partners':
        return <PartnersView />;
      case 'tracking':
      case 'my_applications':
        return <TrackingView />;
      case 'documents':
        return <DocumentsView />;
      case 'ai':
        return <AiAssistantView />;
      case 'profile':
      case 'settings':
        return <ProfileView />;
      case 'help_trust':
        return <HelpTrustView />;
      case 'login':
        return <LoginView initialTab="login" onLoginSuccess={() => navigateTo('home')} />;
      case 'signup':
        return <LoginView initialTab="signup" onLoginSuccess={() => navigateTo('home')} />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  const isJourneyMode = currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme';

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] pb-16 lg:pb-0 font-sans text-[#1E293B] overflow-x-hidden w-full max-w-[100vw]">
      {/* Top Application Header */}
      <Header />

      <div className="flex-1 flex w-full min-w-0">
        {/* Left Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Main Application Workspace Area */}
        <main
          className={`flex-1 min-w-0 ${
            isJourneyMode
              ? 'p-0 max-w-full'
              : 'px-3 sm:px-6 md:px-8 py-3.5 sm:py-6 max-w-7xl'
          } mx-auto w-full overflow-x-hidden`}
        >
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile-first Thumb Bottom Navigation */}
      <BottomNav />

      {/* Floating AI Assistant Drawer */}
      <AiAssistantModal />

      {/* Optional First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {/* Real First-time Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={completeProfileOpen}
        onClose={() => setCompleteProfileOpen(false)}
      />
    </div>
  );
}
