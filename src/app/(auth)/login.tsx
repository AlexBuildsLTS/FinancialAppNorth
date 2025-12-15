import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  useWindowDimensions 
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Activity, 
  PieChart, BarChart3, FileText, Users, Twitter, Facebook, 
  Instagram, Linkedin, Heart, CheckCircle2, Headphones 
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../shared/components/GlassCard';

// --- Reusable UI Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <View className='mt-8 mb-6'>
    <Text className='mb-2 text-2xl font-bold text-white'>{title}</Text>
    <View className='h-1 w-16 bg-[#64FFDA] rounded-full' />
  </View>
);

const FeatureItem = ({ icon: Icon, title, desc, className }: any) => (
  <View className={`bg-[#112240] p-5 rounded-2xl border border-[#233554] mb-4 ${className}`}>
    <View className='flex-row items-center mb-3'>
      <View className='bg-[#64FFDA]/10 w-10 h-10 rounded-full items-center justify-center mr-3'>
        <Icon size={20} color='#64FFDA' />
      </View>
      <Text className='flex-1 text-lg font-bold text-white'>{title}</Text>
    </View>
    <Text className='text-[#8892B0] text-sm leading-5'>{desc}</Text>
  </View>
);

const TierCard = ({ title, subtitle, features, recommended, className }: any) => (
  <View className={`p-6 rounded-2xl border mb-6 ${recommended ? 'bg-[#112240] border-[#64FFDA]' : 'bg-[#0A192F] border-[#233554]'} ${className}`}>
    {recommended && (
      <View className='bg-[#64FFDA] px-3 py-1 rounded-full self-start mb-3'>
        <Text className='text-[#0A192F] text-xs font-bold uppercase'>Recommended</Text>
      </View>
    )}
    <Text className='mb-1 text-2xl font-bold text-white'>{title}</Text>
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
  <View className='mb-8 min-w-[150px]'>
    <Text className='mb-4 text-base font-bold text-white'>{title}</Text>
    {links.map((link: string, i: number) => (
      <TouchableOpacity key={i} className='mb-2'>
        <Text className='text-[#8892B0] text-sm hover:text-[#64FFDA]'>{link}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// --- Main Component ---

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024; // Desktop Breakpoint
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 1. Strict Input Validation
    if (!email.trim() || !password) {
      Alert.alert('Missing Credentials', 'Please enter both your email and password.');
      return;
    }

    // 2. Authentication Flow
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation is handled automatically by AuthContext listener
    } catch (error: any) {
      console.error(error);
      const msg = error.message || 'Please check your credentials and try again.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Layout Renderers ---

  const LoginForm = () => (
    <View className='w-full max-w-md mx-auto'>
      <Animated.View entering={FadeInDown.duration(600)} className='items-center mb-10'>
        <View className='w-20 h-20 bg-[#112240] rounded-2xl items-center justify-center mb-6 border border-[#64FFDA]/20 shadow-xl shadow-[#64FFDA]/10'>
            <Text className='text-[#64FFDA] font-extrabold text-4xl'>N</Text>
        </View>
        <Text className='text-3xl font-bold tracking-tight text-center text-white'>Welcome Back</Text>
        <Text className='text-[#8892B0] text-center mt-2 text-base'>Sign in to manage your finances</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <GlassCard className='gap-5 p-6 border border-[#233554] bg-[#112240]/80'>
          
          <View>
            <Text className='text-[#8892B0] text-xs font-bold mb-2 ml-1 uppercase tracking-wider'>Work Email</Text>
            <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center focus:border-[#64FFDA]'>
                <Mail size={20} color='#8892B0' />
                <TextInput 
                  className='flex-1 h-full ml-3 text-base text-white outline-none' 
                  placeholder='admin@nf.com' 
                  placeholderTextColor='#475569' 
                  autoCapitalize='none' 
                  keyboardType='email-address' 
                  value={email} 
                  onChangeText={setEmail} 
                />
            </View>
          </View>

          <View>
            <Text className='text-[#8892B0] text-xs font-bold mb-2 ml-1 uppercase tracking-wider'>Password</Text>
            <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center focus:border-[#64FFDA]'>
                <Lock size={20} color='#8892B0' />
                <TextInput 
                  className='flex-1 h-full ml-3 text-base text-white outline-none' 
                  placeholder='••••••••' 
                  placeholderTextColor='#475569' 
                  secureTextEntry={!showPassword} 
                  value={password} 
                  onChangeText={setPassword} 
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  {showPassword ? <EyeOff size={20} color='#8892B0' /> : <Eye size={20} color='#8892B0' />}
                </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            className={`bg-[#64FFDA] h-14 rounded-xl items-center justify-center flex-row mt-4 shadow-lg shadow-[#64FFDA]/20 active:opacity-90 ${loading ? 'opacity-80' : ''}`}
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#0A192F' />
            ) : (
              <>
                <Text className='text-[#0A192F] font-bold text-lg mr-2'>Sign In</Text>
                <ArrowRight size={20} color='#0A192F' />
              </>
            )}
          </TouchableOpacity>

          <View className='flex-row justify-center mt-4'>
            <Text className='text-[#8892B0]'>New Organization? </Text>
            <Link href='/(auth)/register' asChild>
              <TouchableOpacity><Text className='text-[#64FFDA] font-bold'>Create Account</Text></TouchableOpacity>
            </Link>
          </View>

        </GlassCard>
      </Animated.View>
    </View>
  );

  const MarketingContent = () => (
    <View className='w-full'>
        {/* About Section */}
        <View className='mb-16'>
            <View className='w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-4 border border-[#64FFDA]/30'>
            <Text className='text-[#64FFDA] font-bold text-xl'>N</Text>
            </View>
            <Text className='mb-4 text-3xl font-bold text-white'>About NorthFinance</Text>
            <Text className='text-[#8892B0] text-base leading-7 max-w-3xl'>
            NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health.
            </Text>
        </View>

        {/* Features Grid */}
        <View className='mb-16'>
            <SectionHeader title='Platform Capabilities' />
            <View className={`flex-row flex-wrap ${isDesktop ? '-mx-2' : ''}`}>
                <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={Activity} title='Smart Ledger' desc='AI-powered tagging & anomaly detection.' />
                <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={PieChart} title='Dynamic Budgeting' desc='Real-time forecasting for accounts.' />
                <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={BarChart3} title='Advanced Analytics' desc='Interactive visualizations.' />
                <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={Shield} title='AI Assistant' desc='Instant financial answers.' />
            </View>
        </View>

        {/* Tiers Grid */}
        <View className='mb-16'>
            <SectionHeader title='Membership Tiers' />
            <View className={`flex-row flex-wrap ${isDesktop ? '-mx-3' : ''}`}>
                <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='Member' subtitle='Starter' features={['Basic tracking', 'Budgets']} />
                <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='Premium' subtitle='Pro' recommended={true} features={['Advanced analytics', 'AI insights']} />
                <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='CPA' subtitle='Certified' features={['Client dashboard', 'Reporting']} />
            </View>
        </View>

        {/* Footer */}
        <View className='border-t border-[#233554] pt-12 pb-8'>
            <View className='flex-row flex-wrap justify-between w-full'>
                <FooterColumn title='Company' links={['About Us', 'Careers', 'Press', 'Blog']} />
                <FooterColumn title='Products' links={['Personal Finance', 'Business Solutions', 'CPA Tools', 'API']} />
                <FooterColumn title='Legal' links={['Privacy', 'Terms', 'Security']} />
            </View>
            <View className='h-[1px] bg-[#233554] w-full my-8' />
            <View className='flex-row items-center justify-between'>
                <Text className='text-[#4A5568] text-xs'>© 2025 NorthFinance. Encrypted & Secure.</Text>
                <View className='flex-row gap-4'>
                    <Twitter size={18} color='#8892B0' />
                    <Linkedin size={18} color='#8892B0' />
                </View>
            </View>
        </View>
    </View>
  );

  return (
    <View className='flex-1 bg-[#0A192F]'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          {isDesktop ? (
            // --- DESKTOP SPLIT LAYOUT ---
            <View className='flex-row flex-1'>
                {/* Left Side: Login Form (Fixed/Sticky feel) */}
                <View className='w-[40%] h-full justify-center items-center px-12 border-r border-[#233554] bg-[#0A192F] z-10'>
                    <LoginForm />
                </View>

                {/* Right Side: Scrollable Marketing Content */}
                <ScrollView 
                    className='flex-1 bg-[#0B1C36]' 
                    contentContainerStyle={{ padding: 64, minHeight: '100%' }}
                    showsVerticalScrollIndicator={false}
                >
                    <MarketingContent />
                </ScrollView>
            </View>
          ) : (
            // --- MOBILE STACKED LAYOUT ---
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ minHeight: height * 0.85 }} className='items-center justify-center flex-1 px-6 py-12'>
                <LoginForm />
              </View>
              <View className='bg-[#0B1C36] px-6 py-12 border-t border-[#233554]'>
                <MarketingContent />
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}