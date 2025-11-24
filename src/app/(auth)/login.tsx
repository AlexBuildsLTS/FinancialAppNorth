import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft, Check, Shield, Activity, Globe, Lock, User, Mail, ChevronRight, BarChart3, FileText, Users, Headphones, PieChart, CheckCircle2, Twitter, Facebook, Instagram, Linkedin, Heart, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Components (Identical to Register for consistency) ---

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

// --- Main Login Screen ---

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
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
            
            {/* --- TOP: Login Form --- */}
            <View className='px-6 pt-4 pb-12'>
              {/* Note: No back button on Login usually, but added spacer for consistency if needed */}
              <View className="h-10 mb-6" /> 
              
              <View className='items-center mb-8'>
                <View className='w-16 h-16 bg-[#64FFDA] rounded-2xl items-center justify-center mb-4 shadow-lg'>
                   <Text className='text-[#0A192F] font-bold text-3xl'>N</Text>
                </View>
                <Text className='text-3xl font-bold text-white mb-2'>Welcome Back</Text>
                <Text className='text-[#8892B0] text-center'>Sign in to manage your finances</Text>
              </View>

              <View className='gap-4'>
                {/* Email Input */}
                <View className='bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center'>
                  <Mail size={20} color='#8892B0' />
                  <TextInput 
                    className='flex-1 text-white text-base ml-3 h-full' 
                    placeholder='Email Address' 
                    placeholderTextColor='#475569'
                    autoCapitalize='none' 
                    keyboardType='email-address'
                    value={email} 
                    onChangeText={setEmail}
                  />
                </View>

                {/* Password Input */}
                <View className='bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center'>
                  <Lock size={20} color='#8892B0' />
                  <TextInput 
                    className='flex-1 text-white text-base ml-3 h-full' 
                    placeholder='Password' 
                    placeholderTextColor='#475569'
                    secureTextEntry={!showPassword}
                    value={password} 
                    onChangeText={setPassword}
                  />
                  {/* Optional: Add Eye Icon here */}
                </View>

                <TouchableOpacity 
                  className='bg-[#64FFDA] h-14 rounded-xl items-center justify-center shadow-lg mt-2' 
                  onPress={handleLogin} 
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color='#0A192F' /> : (
                    <Text className='text-[#0A192F] font-bold text-lg'>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View className='flex-row justify-center mt-4'>
                  <Text className='text-[#8892B0]'>New here? </Text>
                  <Link href='/(auth)/register' asChild>
                    <TouchableOpacity><Text className='text-[#64FFDA] font-bold'>Create Account</Text></TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>

            {/* --- MIDDLE: Info Content (Matching Register) --- */}
            <View className='bg-[#0B1C36] px-6 py-12 border-t border-[#233554]'>
              
              {/* About */}
              <View className='mb-12'>
                <View className='w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-4 border border-[#64FFDA]/30'>
                  <Text className='text-[#64FFDA] font-bold text-xl'>N</Text>
                </View>
                <Text className='text-3xl font-bold text-white mb-4'>About NorthFinance</Text>
                <Text className='text-[#8892B0] text-base leading-6'>
                  NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health. We combine cutting-edge AI technology with professional CPA expertise to deliver a seamless, secure, and intuitive financial management experience.
                </Text>
              </View>

              {/* Mission */}
              <View className='mb-12'>
                <SectionHeader title='Our Mission' />
                <Text className='text-[#8892B0] text-base leading-6'>
                  We believe financial clarity should be accessible to everyone. Our mission is to democratize professional-grade financial management tools, making them intuitive enough for individuals while powerful enough for certified professionals. Through innovative technology and human expertise, we help our users make informed financial decisions with confidence.
                </Text>
              </View>

              {/* What We Offer */}
              <View className='mb-12'>
                <SectionHeader title='What We Offer' />
                <FeatureItem icon={Activity} title='Smart Transaction Tracking' desc='Automatically categorize and analyze your financial transactions with AI-powered insights.' />
                <FeatureItem icon={PieChart} title='Intelligent Budgeting' desc='Set custom budgets and receive real-time alerts when approaching spending limits.' />
                <FeatureItem icon={BarChart3} title='Advanced Analytics' desc='Visualize your financial health with interactive charts and comprehensive reports.' />
                <FeatureItem icon={Shield} title='AI Financial Assistant' desc='Get instant answers to your financial questions powered by advanced AI technology.' />
                <FeatureItem icon={FileText} title='Document Management' desc='Securely store and organize receipts, invoices, and important financial documents.' />
                <FeatureItem icon={Users} title='CPA Collaboration' desc='Connect with certified CPAs for professional financial guidance and tax preparation.' />
              </View>

              {/* Membership Tiers */}
              <View className='mb-12'>
                <SectionHeader title='Membership Tiers' />
                <Text className='text-[#8892B0] mb-6'>Choose the membership level that fits your needs. From individuals to certified professionals.</Text>
                
                <TierCard 
                  title='Member' 
                  subtitle='Perfect for individuals starting their financial journey'
                  features={['Basic transaction tracking', 'Budget creation and monitoring', 'Financial document storage', 'Monthly spending reports']}
                />

                <TierCard 
                  title='Premium' 
                  subtitle='For serious financial planners who want advanced insights'
                  recommended={true}
                  features={['Everything in Member', 'Advanced analytics and reports', 'AI-powered financial insights', 'Custom budget categories', 'CPA consultation requests', 'Priority support']}
                />

                <TierCard 
                  title='CPA' 
                  subtitle='Certified professionals managing multiple clients'
                  features={['Everything in Premium', 'Client management dashboard', 'Multi-client oversight', 'Professional reporting tools', 'Dedicated CPA resources']}
                />

                <TierCard 
                  title='Support' 
                  subtitle='Team members helping users succeed'
                  features={['Everything in Premium', 'Ticket management system', 'User assistance tools', 'Community moderation']}
                />
              </View>

              {/* Professional Services */}
              <View className='mb-12 bg-[#112240] p-6 rounded-2xl border border-[#64FFDA]/30'>
                <Text className='text-xl font-bold text-white mb-3'>Professional CPA Services</Text>
                <Text className='text-[#8892B0] mb-4'>Premium members and above gain access to our exclusive CPA consultation service. Connect with certified public accountants who can provide professional financial guidance.</Text>
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
                <Text className='text-[#8892B0] leading-6'>Our Support team members have access to Premium features plus powerful ticket management tools to help you succeed. They can answer questions, resolve issues, and provide guidance on using the platform effectively.</Text>
              </View>

            </View>

            {/* --- BOTTOM: Footer --- */}
            <View className='bg-[#020C1B] px-6 py-12'>
               <View className='flex-row flex-wrap justify-between'>
                  <FooterColumn title='Company' links={['About Us', 'Careers', 'Press', 'Blog']} />
                  <FooterColumn title='Products' links={['Personal Finance', 'Business Solutions', 'CPA Tools', 'API']} />
                  <FooterColumn title='Resources' links={['Help Center', 'Documentation', 'Community', 'Status']} />
                  <FooterColumn title='Legal' links={['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']} />
               </View>
               
               <View className='h-[1px] bg-[#233554] w-full my-8' />
               
               <Text className='text-white font-bold mb-4 text-lg'>Get in Touch</Text>
               <Text className='text-[#8892B0] mb-2'>support@northfinance.com</Text>
               <Text className='text-[#8892B0] mb-2'>1-800-NORTH-FIN</Text>
               <Text className='text-[#8892B0] mb-8'>123 Finance Street, San Francisco, CA 94102</Text>
               
               <View className='flex-row gap-4 mb-8'>
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

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}