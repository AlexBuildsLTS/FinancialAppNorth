
import React, { useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';

import { useRouter, Link } from 'expo-router';

import { ArrowLeft, Check, Shield, Activity, Globe, Lock, User, Mail, ChevronRight, BarChart3, FileText, Users, Headphones, PieChart, CheckCircle2, Twitter, Facebook, Instagram, Linkedin, Heart, TrendingUp } from 'lucide-react-native';

import { useAuth } from '../../shared/context/AuthContext';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react';



// --- Components (Reused for consistency) ---



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

            <View className='px-6 pt-12 pb-12 min-h-[85vh] justify-center'>

              

              <View className='items-center mb-10'>

                <View className='w-20 h-20 bg-[#112240] rounded-2xl items-center justify-center mb-6 border border-[#233554] shadow-lg'>

                   <Shield size={40} color='#64FFDA' />

                </View>

                <Text className='text-4xl font-bold text-white mb-3 tracking-tight'>Welcome Back</Text>

                <Text className='text-[#8892B0] text-lg text-center'>Sign in to manage your finances</Text>

              </View>



              <View className='gap-5'>

                {/* Email Input */}

                <View>

                   <Text className='text-[#8892B0] text-sm font-bold mb-2 ml-1 uppercase'>Email Address</Text>

                   <View className='bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center'>

                      <Mail size={20} color='#8892B0' />

                      <TextInput 

                        className='flex-1 text-white text-base ml-3 h-full' 

                        placeholder='admin@nf.com' 

                        placeholderTextColor='#475569'

                        autoCapitalize='none' 

                        keyboardType='email-address'

                        value={email} 

                        onChangeText={setEmail}

                      />

                   </View>

                </View>



                {/* Password Input */}

                <View>

                   <Text className='text-[#8892B0] text-sm font-bold mb-2 ml-1 uppercase'>Password</Text>

                   <View className='bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center'>

                      <Lock size={20} color='#8892B0' />

                      <TextInput 

                        className='flex-1 text-white text-base ml-3 h-full' 

                        placeholder='••••••••' 

                        placeholderTextColor='#475569'

                        secureTextEntry={!showPassword}

                        value={password} 

                        onChangeText={setPassword}

                      />

                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>

                        {/* Add Eye/EyeOff icons if needed, using text for simplicity here if missing */}

                      </TouchableOpacity>

                   </View>

                </View>



                <TouchableOpacity className='bg-[#64FFDA] h-14 rounded-xl items-center justify-center flex-row mt-4 shadow-lg shadow-[#64FFDA]/20' onPress={handleLogin} disabled={loading}>

                  {loading ? <ActivityIndicator color='#0A192F' /> : (

                    <>

                      <Text className='text-[#0A192F] font-bold text-lg mr-2'>Sign In</Text>

                      <ArrowRight size={20} color='#0A192F' />

                    </>

                  )}

                </TouchableOpacity>



                <View className='flex-row justify-center mt-6'>

                  <Text className='text-[#8892B0]'>New here? </Text>

                  <Link href='/(auth)/register' asChild>

                    <TouchableOpacity><Text className='text-[#64FFDA] font-bold'>Create Account</Text></TouchableOpacity>

                  </Link>

                </View>

              </View>

            </View>



            {/* --- MIDDLE: Info Content (Same as Register) --- */}

            <View className='bg-[#0B1C36] px-6 py-12 border-t border-[#233554]'>

              

              {/* Why NorthFinance (Summary) */}

              <View className='mb-12'>

                <Text className='text-3xl font-bold text-white mb-4'>Why NorthFinance?</Text>

                <Text className='text-[#8892B0] text-base leading-6 mb-8'>

                  Secure, intelligent, and professional. We provide the tools you need to take control of your financial future with confidence.

                </Text>



                <ScrollView horizontal showsHorizontalScrollIndicator={false} className='-mx-6 px-6 pb-4'>

                    <View className='bg-[#112240] p-5 rounded-2xl border border-[#233554] w-72 mr-4'>

                        <View className='bg-[#64FFDA]/10 w-12 h-12 rounded-full items-center justify-center mb-4'>

                            <Shield size={24} color='#64FFDA' />

                        </View>

                        <Text className='text-white font-bold text-lg mb-2'>Bank-Level Security</Text>

                        <Text className='text-[#8892B0] text-sm'>Your data is encrypted with AES-256 and protected by biometric authentication.</Text>

                    </View>



                    <View className='bg-[#112240] p-5 rounded-2xl border border-[#233554] w-72 mr-4'>

                        <View className='bg-[#64FFDA]/10 w-12 h-12 rounded-full items-center justify-center mb-4'>

                            <Activity size={24} color='#64FFDA' />

                        </View>

                        <Text className='text-white font-bold text-lg mb-2'>AI Insights</Text>

                        <Text className='text-[#8892B0] text-sm'>Real-time analysis of your spending habits and investment opportunities.</Text>

                    </View>



                    <View className='bg-[#112240] p-5 rounded-2xl border border-[#233554] w-72 mr-4'>

                        <View className='bg-[#64FFDA]/10 w-12 h-12 rounded-full items-center justify-center mb-4'>

                            <Globe size={24} color='#64FFDA' />

                        </View>

                        <Text className='text-white font-bold text-lg mb-2'>Global Access</Text>

                        <Text className='text-[#8892B0] text-sm'>Manage your finances from anywhere in the world with multi-currency support.</Text>

                    </View>

                </ScrollView>

              </View>



              {/* What We Offer (List) */}

              <View className='mb-12'>

                <SectionHeader title='What We Offer' />

                <FeatureItem icon={Activity} title='Smart Transaction Tracking' desc='Automatically categorize and analyze your financial transactions with AI-powered insights.' />

                <FeatureItem icon={PieChart} title='Intelligent Budgeting' desc='Set custom budgets and receive real-time alerts when approaching spending limits.' />

                <FeatureItem icon={BarChart3} title='Advanced Analytics' desc='Visualize your financial health with interactive charts and comprehensive reports.' />

              </View>



            </View>



            {/* --- BOTTOM: Footer --- */}

            <View className='bg-[#020C1B] px-6 py-12'>

               <View className='flex-row flex-wrap justify-between'>

                  <FooterColumn title='Company' links={['About Us', 'Careers', 'Press', 'Blog']} />

                  <FooterColumn title='Products' links={['Personal Finance', 'Business Solutions', 'CPA Tools', 'API']} />

               </View>

               

               <View className='h-[1px] bg-[#233554] w-full my-8' />

               

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



          </ScrollView>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </View>

  );

}

