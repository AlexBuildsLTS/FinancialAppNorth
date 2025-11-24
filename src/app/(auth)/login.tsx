import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Activity, Globe, PieChart, BarChart3, FileText, Users, Twitter, Facebook, Instagram, Linkedin, Heart, CheckCircle2, Headphones } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../shared/components/GlassCard';

// --- Reusable Components ---
const SectionHeader = ({ title }: { title: string }) => (
  <View className='mb-6 mt-8'>
    <Text className='text-2xl font-bold text-white mb-2'>{title}</Text>
    <View className='h-1 w-16 bg-[#64FFDA] rounded-full' />
  </View>
);

const FeatureItem = ({ icon: Icon, title, desc }: any) => (
  <View className='bg-[#112240] p-5 rounded-2xl border border-[#233554] mb-4 w-full'>
    <View className='flex-row items-center mb-3'>
      <View className='bg-[#64FFDA]/10 w-10 h-10 rounded-full items-center justify-center mr-3'>
        <Icon size={20} color='#64FFDA' />
      </View>
      <Text className='text-white font-bold text-lg flex-1'>{title}</Text>
    </View>
    <Text className='text-[#8892B0] text-sm leading-5'>{desc}</Text>
  </View>
);

const TierCard = ({ title, subtitle, features, recommended }: any) => (
  <View className={`p-6 rounded-2xl border mb-6 ${recommended ? 'bg-[#112240] border-[#64FFDA]' : 'bg-[#0A192F] border-[#233554]'}`}>
    {recommended && (
      <View className='bg-[#64FFDA] px-3 py-1 rounded-full self-start mb-3'>
        <Text className='text-[#0A192F] text-xs font-bold uppercase'>Recommended</Text>
      </View>
    )}
    <Text className='text-2xl font-bold text-white mb-1'>{title}</Text>
    <Text className='text-[#8892B0] text-sm mb-4'>{subtitle}</Text>
    <View className='h-[1px] bg-[#233554] w-full mb-4' />
    {features.map((feat: string, i: number) => (
      <View key={i} className='flex-row items-start mb-3'>
        <CheckCircle2 size={16} color='#64FFDA' style={{ marginTop: 2, marginRight: 8 }} />
        <Text className='text-[#E6F1FF] text-sm flex-1'>{feat}</Text>
      </View>
    ))}
  </View>
);

const FooterColumn = ({ title, links }: any) => (
  <View className='mb-8 w-[48%]'>
    <Text className='text-white font-bold mb-4 text-base'>{title}</Text>
    {links.map((link: string, i: number) => (
      <TouchableOpacity key={i} className='mb-2'>
        <Text className='text-[#8892B0] text-sm'>{link}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { height } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-[#0A192F]'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            {/* --- CENTERED LOGIN CARD SECTION --- */}
            <View style={{ minHeight: height * 0.8 }} className='flex-1 justify-center items-center px-6 py-12'>
              <View className='w-full max-w-md'>
                <Animated.View entering={FadeInDown.duration(600)} className='items-center mb-8'>
                  <View className='w-16 h-16 bg-[#64FFDA] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-[#64FFDA]/20'>
                     <Text className='text-[#0A192F] font-extrabold text-3xl'>N</Text>
                  </View>
                  <Text className='text-3xl font-bold text-white tracking-tight text-center'>Welcome Back</Text>
                  <Text className='text-[#8892B0] text-center mt-2'>Sign in to manage your finances</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                  <GlassCard className='gap-5 p-6'>
                    <View>
                      <Text className='text-[#8892B0] text-xs font-bold mb-2 ml-1 uppercase tracking-wider'>Email</Text>
                      <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center focus:border-[#64FFDA]'>
                          <Mail size={20} color='#8892B0' />
                          <TextInput className='flex-1 text-white text-base ml-3 h-full' placeholder='admin@nf.com' placeholderTextColor='#475569' autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} />
                      </View>
                    </View>
                    <View>
                      <Text className='text-[#8892B0] text-xs font-bold mb-2 ml-1 uppercase tracking-wider'>Password</Text>
                      <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center focus:border-[#64FFDA]'>
                          <Lock size={20} color='#8892B0' />
                          <TextInput className='flex-1 text-white text-base ml-3 h-full' placeholder='••••••••' placeholderTextColor='#475569' secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} color='#8892B0' /> : <Eye size={20} color='#8892B0' />}
                          </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity className='bg-[#64FFDA] h-14 rounded-xl items-center justify-center flex-row mt-4 shadow-lg shadow-[#64FFDA]/20 active:opacity-90' onPress={handleLogin} disabled={loading}>
                      {loading ? <ActivityIndicator color='#0A192F' /> : (
                        <>
                          <Text className='text-[#0A192F] font-bold text-lg mr-2'>Sign In</Text>
                          <ArrowRight size={20} color='#0A192F' />
                        </>
                      )}
                    </TouchableOpacity>
                    <View className='flex-row justify-center mt-4'>
                      <Text className='text-[#8892B0]'>New here? </Text>
                      <Link href='/(auth)/register' asChild>
                        <TouchableOpacity><Text className='text-[#64FFDA] font-bold'>Create Account</Text></TouchableOpacity>
                      </Link>
                    </View>
                  </GlassCard>
                </Animated.View>
              </View>
            </View>

            {/* --- FULL BOTTOM CONTENT (Restored) --- */}
            <View className='bg-[#0B1C36] px-6 py-12 border-t border-[#233554]'>
              
              <View className='mb-8 max-w-md mx-auto w-full'>
                {/* About */}
                <View className='mb-12'>
                  <View className='w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-4 border border-[#64FFDA]/30'>
                    <Text className='text-[#64FFDA] font-bold text-xl'>N</Text>
                  </View>
                  <Text className='text-3xl font-bold text-white mb-4'>About NorthFinance</Text>
                  <Text className='text-[#8892B0] text-base leading-6'>
                    NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health.
                  </Text>
                </View>

                {/* Mission */}
                <View className='mb-12'>
                  <SectionHeader title='Our Mission' />
                  <Text className='text-[#8892B0] text-base leading-6'>
                    We believe financial clarity should be accessible to everyone. Our mission is to democratize professional-grade financial management tools.
                  </Text>
                </View>

                {/* What We Offer */}
                <View className='mb-12'>
                  <SectionHeader title='What We Offer' />
                  <FeatureItem icon={Activity} title='Smart Transaction Tracking' desc='Automatically categorize and analyze your financial transactions.' />
                  <FeatureItem icon={PieChart} title='Intelligent Budgeting' desc='Set custom budgets and receive real-time alerts.' />
                  <FeatureItem icon={BarChart3} title='Advanced Analytics' desc='Visualize your financial health with interactive charts.' />
                  <FeatureItem icon={Shield} title='AI Financial Assistant' desc='Get instant answers to your financial questions.' />
                  <FeatureItem icon={FileText} title='Document Management' desc='Securely store receipts and important documents.' />
                  <FeatureItem icon={Users} title='CPA Collaboration' desc='Connect with certified CPAs for professional guidance.' />
                </View>

                {/* Membership Tiers */}
                <View className='mb-12'>
                  <SectionHeader title='Membership Tiers' />
                  <Text className='text-[#8892B0] mb-6'>Choose the membership level that fits your needs.</Text>
                  
                  <TierCard title='Member' subtitle='Perfect for individuals starting their financial journey' features={['Basic transaction tracking', 'Budget creation', 'Document storage']} />
                  <TierCard title='Premium' subtitle='For serious financial planners' recommended={true} features={['Everything in Member', 'Advanced analytics', 'AI insights', 'Priority support']} />
                  <TierCard title='CPA' subtitle='Certified professionals' features={['Client dashboard', 'Multi-client oversight', 'Professional reporting']} />
                </View>

                {/* Professional Services */}
                <View className='mb-12 bg-[#112240] p-6 rounded-2xl border border-[#64FFDA]/30'>
                  <Text className='text-xl font-bold text-white mb-3'>Professional CPA Services</Text>
                  <Text className='text-[#8892B0] mb-4'>Premium members and above gain access to our exclusive CPA consultation service.</Text>
                  <View className='bg-[#64FFDA]/10 px-4 py-2 rounded-lg self-start'>
                    <Text className='text-[#64FFDA] font-bold text-xs uppercase'>Available for Premium, CPA, & Admin</Text>
                  </View>
                </View>

                {/* Support Team */}
                <View className='mb-12'>
                  <View className='flex-row items-center gap-3 mb-4'>
                     <Headphones size={24} color='#64FFDA' />
                     <Text className='text-xl font-bold text-white'>Dedicated Support Team</Text>
                  </View>
                  <Text className='text-[#8892B0] leading-6'>Our Support team members have access to Premium features plus powerful ticket management tools to help you succeed.</Text>
                </View>
              </View>

              {/* Footer */}
              <View className='bg-[#020C1B] -mx-6 px-6 py-12'>
                 <View className='flex-row flex-wrap justify-between max-w-md mx-auto w-full'>
                    <FooterColumn title='Company' links={['About Us', 'Careers', 'Press', 'Blog']} />
                    <FooterColumn title='Products' links={['Personal Finance', 'Business Solutions', 'CPA Tools', 'API']} />
                 </View>
                 
                 <View className='h-[1px] bg-[#233554] w-full my-8 max-w-md mx-auto' />
                 
                 <View className='flex-row gap-4 mb-8 justify-center'>
                   {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                     <View key={i} className='w-10 h-10 bg-[#112240] rounded-full items-center justify-center border border-[#233554]'>
                       <Icon size={18} color='#8892B0' />
                     </View>
                   ))}
                 </View>

                 <View className='flex-row items-center justify-center'>
                   <Text className='text-[#4A5568] text-xs'>© 2024 NorthFinance. Made with </Text>
                   <Heart size={10} color='#E11D48' fill='#E11D48' />
                   <Text className='text-[#4A5568] text-xs'> for better financial futures.</Text>
                 </View>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}