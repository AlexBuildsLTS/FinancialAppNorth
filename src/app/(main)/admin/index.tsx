import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';  
import { useTheme } from '@/shared/context/ThemeProvider';    
import ScreenContainer from '@/shared/components/ScreenContainer';  
import UsersComponent from '@/features/admin/components/Manage-users'; // Renamed to avoid conflict with lucide-react-native Users icon
import { AdminOverview as OverviewComponent } from '@/features/admin/components/AdminOverview'; // Assuming this path is correct
import Budgets from '../budgets';


export default function AdminDashboardScreen() { 
  const { theme: { colors } } = useTheme();
  const [selectedTab, setSelectedTab] = useState('overview');
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Admin Dashboard</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, { backgroundColor: selectedTab === 'overview' ? colors.accent : colors.surface }]} onPress={() => setSelectedTab('overview')}>
            <Text style={[styles.tabText, { color: selectedTab === 'overview' ? colors.accent : colors.textPrimary }]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: selectedTab === 'users' ? colors.accent : colors.surface }]} onPress={() => setSelectedTab('users')}>  
            <Text style={[styles.tabText, { color: selectedTab === 'users' ? colors.accent : colors.textPrimary }]}>Users</Text>  
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: selectedTab === 'budgets' ? colors.accent : colors.surface }]} onPress={() => setSelectedTab('budgets')}>  
            <Text style={[styles.tabText, { color: selectedTab === 'budgets' ? colors.accent : colors.textPrimary }]}>Budgets</Text>    
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedTab === 'overview' && <OverviewComponent />}
          {selectedTab === 'users' && <UsersComponent />}
          {selectedTab === 'budgets' && <Budgets />}
        </View>
      </ScrollView>  
    </ScreenContainer>
  );
}   

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',        
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    borderRadius: 12,
  },
});
