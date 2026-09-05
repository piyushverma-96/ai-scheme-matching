import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import FindSchemeScreen from './src/screens/FindSchemeScreen';
import AiInputScreen from './src/screens/AiInputScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import SchemeResultsScreen from './src/screens/SchemeResultsScreen';
import SchemeDetailsScreen from './src/screens/SchemeDetailsScreen';
import EmiCalculatorScreen from './src/screens/EmiCalculatorScreen';
import PartnerFinderScreen from './src/screens/PartnerFinderScreen';
import MapScreen from './src/screens/MapScreen';
import DocumentChecklistScreen from './src/screens/DocumentChecklistScreen';
import ApplicationTrackingScreen from './src/screens/ApplicationTrackingScreen';
import AiAssistantScreen from './src/screens/AiAssistantScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HelpTrustScreen from './src/screens/HelpTrustScreen';
import SchemesListScreen from './src/screens/SchemesListScreen';
import ApplicationsListScreen from './src/screens/ApplicationsListScreen';

function MainRouter() {
  const { currentScreen, navigate } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'language':
        return <LanguageScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'login':
        return <LoginScreen onNavigate={navigate} />;
      case 'signup':
        return <SignupScreen onNavigate={navigate} />;
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'find-scheme':
        return <FindSchemeScreen />;
      case 'ai-input':
        return <AiInputScreen />;
      case 'processing':
        return <ProcessingScreen />;
      case 'scheme-results':
        return <SchemeResultsScreen />;
      case 'scheme-details':
        return <SchemeDetailsScreen />;
      case 'emi-calculator':
        return <EmiCalculatorScreen />;
      case 'partner-finder':
        return <PartnerFinderScreen />;
      case 'map':
        return <MapScreen />;
      case 'documents':
        return <DocumentChecklistScreen />;
      case 'tracking':
        return <ApplicationTrackingScreen />;
      case 'ai-assistant':
        return <AiAssistantScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'help':
        return <HelpTrustScreen />;
      case 'schemes':
        return <SchemesListScreen />;
      case 'applications':
        return <ApplicationsListScreen />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0B2545" />
      {renderScreen()}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
