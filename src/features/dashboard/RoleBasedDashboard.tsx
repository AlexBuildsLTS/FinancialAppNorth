import React from "react";
import { useAuth } from "../../shared/context/AuthContext";
import ScreenContainer from "../../shared/components/ScreenContainer";
import { createText } from "@shopify/restyle";
import { AppTheme } from "../../shared/theme/theme";
import { TextProps } from "@shopify/restyle";
import { Text } from "react-native";






// Placeholder components for role-specific dashboards
// In a real implementation, these would be in their own files
const MemberDashboard: React.FC = () => <Text>Welcome, Member!</Text>;
const PremiumDashboard: React.FC = () => <Text>Welcome, Premium Member!</Text>;
const CPADashboard: React.FC = () => <Text>CPA Client Dashboard</Text>;
const AdminDashboard: React.FC = () => <Text>Admin System Overview</Text>;
const SupportDashboard: React.FC = () => <Text>Support Ticket Dashboard</Text>;


/**
 * A top-level component for the main dashboard screen ('/home') that
 * acts as a router, rendering the correct dashboard view
 * based on the authenticated user's role.
 */
export const RoleBasedDashboard: React.FC = () => {
  const { profile } = useAuth();

  const renderDashboard = () => {
    switch (profile?.role) {
      case "member": // UserRole.MEMBER
        return <MemberDashboard />;
      case "premium": // UserRole.PREMIUM_MEMBER
        return <PremiumDashboard />;
      case "cpa": // UserRole.CPA
        return <CPADashboard />;
      case "admin": // UserRole.ADMIN
        return <AdminDashboard />;
      case "support": // UserRole.SUPPORT
        return <SupportDashboard />;
      default:
        // This case should ideally not be hit if auth is working
        return <Text>Loading dashboard...</Text>;
    }
  };

  return (
    <ScreenContainer>
      {renderDashboard()}
    </ScreenContainer>
  );
};

export default RoleBasedDashboard;
    
