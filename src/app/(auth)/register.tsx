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
import { 
  Check, Shield, Activity, Lock, User, Mail, 
  PieChart, BarChart3, FileText, Users, Twitter, 
  Facebook, Instagram, Linkedin, CheckCircle2
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../shared/context/AuthContext';
import { GlassCard } from '../../shared/components/GlassCard';
import { PasswordStrengthIndicator } from '../../shared/components/PasswordStrengthIndicator';

// --- COMPONENTS ---

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

const MarketingContent = React.memo(({ isDesktop }: { isDesktop: boolean }) => (
  <View className='w-full'>
      <View className='mb-16'>
          <View className='w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-4 border border-[#64FFDA]/30'>
          <Text className='text-[#64FFDA] font-bold text-xl'>N</Text>
          </View>
          <Text className='mb-4 text-3xl font-bold text-white'>About NorthFinance</Text>
          <Text className='text-[#8892B0] text-base leading-7 max-w-3xl'>
          NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses.
          </Text>
      </View>

      <View className='mb-16'>
          <SectionHeader title='What We Offer' />
          <View className={`flex-row flex-wrap ${isDesktop ? '-mx-2' : ''}`}>
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={Activity} title='Smart Tracking' desc='AI-powered categorization.' />
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={PieChart} title='Intelligent Budgets' desc='Real-time alerts.' />
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={BarChart3} title='Analytics' desc='Visual reports & charts.' />
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={Shield} title='AI Assistant' desc='Instant answers.' />
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={FileText} title='Documents' desc='Secure storage.' />
              <FeatureItem className={isDesktop ? 'w-1/2 px-2' : 'w-full'} icon={Users} title='CPA Collab' desc='Professional guidance.' />
          </View>
      </View>

      <View className='mb-16'>
          <SectionHeader title='Membership Tiers' />
          <View className={`flex-row flex-wrap ${isDesktop ? '-mx-3' : ''}`}>
              <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='Member' subtitle='Starter' features={['Basic tracking', 'Budgets']} />
              <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='Premium' subtitle='Pro' recommended={true} features={['Advanced analytics', 'AI insights']} />
              <TierCard className={isDesktop ? 'w-1/3 px-3' : 'w-full'} title='CPA' subtitle='Certified' features={['Client dashboard', 'Multi-client']} />
          </View>
      </View>

      <View className='border-t border-[#233554] pt-12 pb-8'>
          <View className='flex-row flex-wrap justify-between w-full'>
              <FooterColumn title='Company' links={['About Us', 'Careers', 'Press', 'Blog']} />
              <FooterColumn title='Products' links={['Personal Finance', 'Business Solutions', 'CPA Tools', 'API']} />
              <FooterColumn title='Legal' links={['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']} />
          </View>
          <View className='h-[1px] bg-[#233554] w-full my-8' />
          <View className='flex-row items-center justify-between'>
              <Text className='text-[#4A5568] text-xs'>© 2025 NorthFinance. Made with ❤️ for better financial futures.</Text>
              <View className='flex-row gap-4'>
                  <Twitter size={18} color='#8892B0' />
                  <Facebook size={18} color='#8892B0' />
                  <Instagram size={18} color='#8892B0' />
                  <Linkedin size={18} color='#8892B0' />
              </View>
          </View>
      </View>
  </View>
));

// --- MAIN SCREEN ---

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  
  const [form, setForm] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    agreed: false
  });

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.agreed) return Alert.alert('Terms Required', 'You must agree to the Terms of Service.');
    if (form.password !== form.confirmPassword) return Alert.alert('Password Mismatch', 'Passwords do not match.');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return Alert.alert('Incomplete', 'Fill in all fields.');
    if (form.password.length < 6) return Alert.alert('Weak Password', 'Minimum 6 characters.');

    try {
      await register(form.email.trim(), form.password, form.firstName.trim(), form.lastName.trim());
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Error occurred.');
    }
  };

  const RegisterInputs = () => (
    <View className='w-full max-w-md mx-auto'>
        <Animated.View entering={FadeInDown.duration(600)} className='items-center mb-8'>
            <View className='w-16 h-16 bg-[#64FFDA] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-[#64FFDA]/20'>
                <Text className='text-[#0A192F] font-extrabold text-3xl'>N</Text>
            </View>
            <Text className='text-3xl font-bold tracking-tight text-center text-white'>Create Account</Text>
            <Text className='text-[#8892B0] text-center mt-2'>Join NorthFinance today</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <GlassCard className='gap-4 p-5 border border-[#233554] bg-[#112240]/90'>
            
            <View className='flex-row gap-3'>
                <View className='flex-1'>
                <Text className='text-[#8892B0] text-xs font-bold mb-1 ml-1 uppercase tracking-wider'>First Name</Text>
                <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-3 h-12 flex-row items-center focus:border-[#64FFDA]'>
                    <User size={18} color='#8892B0' />
                    <TextInput 
                        className='flex-1 h-full ml-2 text-sm text-white outline-none' 
                        placeholder='Jane' 
                        placeholderTextColor='#475569'
                        value={form.firstName} 
                        onChangeText={t => updateForm('firstName', t)}
                        editable={!isLoading}
                    />
                </View>
                </View>
                <View className='flex-1'>
                <Text className='text-[#8892B0] text-xs font-bold mb-1 ml-1 uppercase tracking-wider'>Last Name</Text>
                <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-3 h-12 flex-row items-center focus:border-[#64FFDA]'>
                    <User size={18} color='#8892B0' />
                    <TextInput 
                        className='flex-1 h-full ml-2 text-sm text-white outline-none' 
                        placeholder='Doe' 
                        placeholderTextColor='#475569'
                        value={form.lastName} 
                        onChangeText={t => updateForm('lastName', t)}
                        editable={!isLoading}
                    />
                </View>
                </View>
            </View>

            <View>
                <Text className='text-[#8892B0] text-xs font-bold mb-1 ml-1 uppercase tracking-wider'>Email</Text>
                <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-12 flex-row items-center focus:border-[#64FFDA]'>
                    <Mail size={18} color='#8892B0' />
                    <TextInput 
                    className='flex-1 h-full ml-3 text-sm text-white outline-none' 
                    placeholder='jane@nf.com' 
                    placeholderTextColor='#475569'
                    autoCapitalize='none' 
                    keyboardType='email-address'
                    value={form.email} 
                    onChangeText={t => updateForm('email', t)}
                    editable={!isLoading}
                    />
                </View>
            </View>

            <View>
                <Text className='text-[#8892B0] text-xs font-bold mb-1 ml-1 uppercase tracking-wider'>Password</Text>
                <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-12 flex-row items-center focus:border-[#64FFDA]'>
                    <Lock size={18} color='#8892B0' />
                    <TextInput 
                    className='flex-1 h-full ml-3 text-sm text-white outline-none' 
                    placeholder='••••••••' 
                    placeholderTextColor='#475569'
                    secureTextEntry
                    value={form.password} 
                    onChangeText={t => updateForm('password', t)}
                    editable={!isLoading}
                    />
                </View>
                <View className='mt-2'>
                    <PasswordStrengthIndicator password={form.password} />
                </View>
            </View>

            <View>
                <Text className='text-[#8892B0] text-xs font-bold mb-1 ml-1 uppercase tracking-wider'>Confirm Password</Text>
                <View className='bg-[#0A192F] border border-[#233554] rounded-xl px-4 h-12 flex-row items-center focus:border-[#64FFDA]'>
                    <Lock size={18} color='#8892B0' />
                    <TextInput 
                    className='flex-1 h-full ml-3 text-sm text-white outline-none' 
                    placeholder='••••••••' 
                    placeholderTextColor='#475569'
                    secureTextEntry
                    value={form.confirmPassword} 
                    onChangeText={t => updateForm('confirmPassword', t)}
                    editable={!isLoading}
                    />
                </View>
            </View>

            <TouchableOpacity 
                className='flex-row items-start gap-3 mt-1' 
                onPress={() => updateForm('agreed', !form.agreed)}
                activeOpacity={0.8}
                disabled={isLoading}
            >
                <View className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${form.agreed ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#0A192F] border-[#233554]'}`}>
                {form.agreed && <Check size={12} color='#0A192F' strokeWidth={4} />}
                </View>
                <Text className='text-[#8892B0] text-xs flex-1 leading-5'>
                I agree to the <Text className='text-[#64FFDA] font-bold'>Terms</Text> & <Text className='text-[#64FFDA] font-bold'>Privacy Policy</Text>.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className={`bg-[#64FFDA] h-12 rounded-xl items-center justify-center shadow-lg mt-2 active:opacity-90 ${isLoading || !form.agreed ? 'opacity-80 bg-[#233554]' : ''}`}
                onPress={handleRegister}
                disabled={isLoading || !form.agreed}
            >
                {isLoading ? (
                <ActivityIndicator color='#64FFDA' />
                ) : (
                <Text className={`font-bold text-lg ${!form.agreed ? 'text-[#8892B0]' : 'text-[#0A192F]'}`}>
                    Create Account
                </Text>
                )}
            </TouchableOpacity>

            <View className='flex-row justify-center mt-2'>
                <Text className='text-[#8892B0] text-sm'>Already have an account? </Text>
                <Link href='/(auth)/login' asChild>
                <TouchableOpacity><Text className='text-[#64FFDA] font-bold text-sm'>Sign In</Text></TouchableOpacity>
                </Link>
            </View>

            </GlassCard>
        </Animated.View>
        
        <View className='flex-row items-center justify-center mt-8 opacity-60'>
            <Shield size={14} color='#8892B0' />
            <Text className='text-[#8892B0] text-xs ml-2'>Encrypted & Secure</Text>
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
            <View className='flex-row flex-1'>
                <View className='w-[40%] h-full justify-center items-center px-12 border-r border-[#233554] bg-[#0A192F] z-10'>
                    <RegisterInputs />
                </View>
                <ScrollView 
                    className='flex-1 bg-[#0B1C36]' 
                    contentContainerStyle={{ padding: 64, minHeight: '100%' }}
                    showsVerticalScrollIndicator={false}
                >
                    <MarketingContent isDesktop={isDesktop} />
                </ScrollView>
            </View>
          ) : (
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ minHeight: height * 0.9 }} className='items-center justify-center flex-1 px-6 py-12'>
                <RegisterInputs />
              </View>
              <View className='bg-[#0B1C36] px-6 py-12 border-t border-[#233554]'>
                <MarketingContent isDesktop={isDesktop} />
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}