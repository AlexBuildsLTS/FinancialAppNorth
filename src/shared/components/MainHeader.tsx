import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Platform, useWindowDimensions } from 'react-native';
import { Bell, MessageSquare, LogOut, User as UserIcon, Settings, ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getNotifications, subscribeToNotifications, markAllNotificationsRead, NotificationItem } from '../../services/dataService';

export function MainHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // UI State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Real Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Load notifications on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const subscription = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications(prev => {
        // Avoid duplicates
        if (prev.some(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleMarkRead = async () => {
    if (!user?.id) return;
    try {
      // Mark all as read in DB
      await markAllNotificationsRead(user.id);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  return (
    <View className="flex-row justify-between items-center px-6 py-4 bg-[#0A192F] border-b border-[#233554] z-50">
      
      {/* 1. Brand / Title */}
      <View>
        <Text className="text-white font-bold text-xl">NorthFinance</Text>
        <Text className="text-[#8892B0] text-xs">Welcome back, {user?.name?.split(' ')[0]}</Text>
      </View>

      {/* 2. Right Action Icons */}
      <View className="flex-row items-center gap-4">
        
        {/* Messages (Mobile Only) */}
        {isMobile && (
            <TouchableOpacity onPress={() => router.push('/(main)/messages')} className="p-2 relative">
                <MessageSquare size={22} color="#8892B0" />
            </TouchableOpacity>
        )}

        {/* Notifications Bell */}
        <View className="relative">
            <TouchableOpacity onPress={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }} className="p-2">
                <Bell size={22} color={showNotifMenu ? "#64FFDA" : "#8892B0"} />
                {unreadCount > 0 && (
                    <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0A192F]" />
                )}
            </TouchableOpacity>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
                <View className="absolute top-12 right-0 w-72 bg-[#112240] border border-[#233554] rounded-xl shadow-xl p-2 z-50">
                    <View className="flex-row justify-between items-center px-3 py-2 mb-2 border-b border-white/5">
                        <Text className="text-white font-bold">Notifications</Text>
                        {unreadCount > 0 && (
                            <TouchableOpacity onPress={handleMarkRead}>
                                <Text className="text-[#64FFDA] text-xs">Mark all read</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {notifications.map((n) => (
                        <View key={n.id} className={`p-3 rounded-lg mb-1 ${n.is_read ? 'opacity-50' : 'bg-[#64FFDA]/10'}`}>
                            <Text className="text-white text-xs leading-5">{n.title}: {n.message}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>

        {/* Profile Avatar & Dropdown */}
        <View className="relative">
          <TouchableOpacity onPress={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}>
            <Image 
                source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
                className="w-9 h-9 rounded-full border border-[#64FFDA]/30"
            />
          </TouchableOpacity>

          {showProfileMenu && (
            <View className="absolute top-12 right-0 w-48 bg-[#112240] border border-[#233554] rounded-xl shadow-xl overflow-hidden z-50">
              <TouchableOpacity onPress={() => router.push('/(main)/settings/profile')} className="flex-row items-center px-4 py-3 hover:bg-white/5">
                <UserIcon size={16} color="#8892B0" className="mr-3" />
                <Text className="text-white text-sm">Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/(main)/settings')} className="flex-row items-center px-4 py-3 hover:bg-white/5">
                <Settings size={16} color="#8892B0" className="mr-3" />
                <Text className="text-white text-sm">Settings</Text>
              </TouchableOpacity>

              {user?.role === 'admin' && (
                  <TouchableOpacity onPress={() => router.push('/(main)/admin')} className="flex-row items-center px-4 py-3 hover:bg-white/5">
                    <ShieldAlert size={16} color="#F59E0B" className="mr-3" />
                    <Text className="text-white text-sm">Admin Panel</Text>
                  </TouchableOpacity>
              )}

              <View className="h-[1px] bg-white/10 my-1" />
              
              <TouchableOpacity onPress={logout} className="flex-row items-center px-4 py-3 hover:bg-red-500/10">
                <LogOut size={16} color="#F87171" className="mr-3" />
                <Text className="text-[#F87171] text-sm font-bold">Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}