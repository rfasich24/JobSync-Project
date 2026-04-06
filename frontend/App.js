import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TextInput, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { supabase } from './supabase';
import { api } from './src/api';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';


// Pastikan redirect browser ditangani dengan benar
WebBrowser.maybeCompleteAuthSession();

// IMPORT KOMPONEN
import AppCard from './src/components/AppCard';
import AgendaCard from './src/components/AgendaCard';
import ProfileTab from './src/components/ProfileTab';
import StatusModal from './src/components/StatusModal';
import ScheduleModal from './src/components/ScheduleModal';

export default function App() {
  const [session, setSession] = useState(null);
  // INISIALISASI SELALU DENGAN ARRAY KOSONG [] UNTUK MENCEGAH .filter/map IS NOT A FUNCTION
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [viewMode, setViewMode] = useState('all'); 
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isIntModalVisible, setIsIntModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInt, setSelectedInt] = useState(null);

  // --- LOGIKA AUTH (Lintas Platform) ---
  const isWeb = Platform.OS === 'web';
  
  // Perbaikan Redirect URI agar tidak crash di Web
  const redirectTo = isWeb 
    ? window.location.origin 
    : AuthSession.makeRedirectUri({ scheme: 'jobsync' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { 
        setSession(session); 
        fetchData(session.access_token); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.access_token);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createSessionFromUrl = async (url) => {
    try {
      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode || !params?.access_token) return;

      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });

      if (data?.session) {
        setSession(data.session);
        fetchData(data.session.access_token);
      }
    } catch (err) {
      console.error("Session Error:", err);
    }
  };

  const performOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo, 
          skipBrowserRedirect: !isWeb, // Di Web harus false agar redirect normal
          queryParams: {
            prompt: 'select_account', // Biar pilihan akun muncul terus
            access_type: 'offline',
          }
        },
      });

      if (error) throw error;

      // Mobile handling (Brave/Chrome popup di dalam App)
      if (!isWeb && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (res.type === 'success' && res.url) {
          await createSessionFromUrl(res.url);
        }
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      if (!isWeb) Alert.alert("Login Error", error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setApplications([]);
    setInterviews([]);
  };
const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(); // Panggil ulang data dari Go
    setRefreshing(false); // Matikan animasi muter-muter
  };
  // --- LOGIKA DATA (Resilient to 500 errors) ---
  const fetchData = async (tokenFromLogin = null) => {
    const token = tokenFromLogin || session?.access_token;
    if (!token) return;
    
    setLoading(true);
    try {
      const apps = await api.getApplications(token);
      const ints = await api.getInterviews(token);
      
      // PROTEKSI: Pastikan data yang masuk adalah Array
      setApplications(Array.isArray(apps) ? apps : []);
      setInterviews(Array.isArray(ints) ? ints : []);
    } catch (err) { 
      console.error("Gagal ambil data:", err);
      // Kalau backend error 500, kita set array kosong agar UI tidak blank putih
      setApplications([]);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIN ---
  if (!session) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.headerTitle}>JobSync 🚀</Text>
        <Text style={styles.subHeader}>Kelola lamaran kerjamu dengan rapi</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={performOAuth}>
          <Text style={{color:'#fff', fontWeight:'bold', fontSize: 16}}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDER UTAMA ---
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>JobSync 🚀</Text>

      <View style={styles.tabContainer}>
        {['all', 'calendar', 'profile'].map((mode) => (
          <TouchableOpacity key={mode} 
            style={[styles.tabBtn, viewMode === mode && styles.activeTab]} 
            onPress={() => setViewMode(mode)}>
            <Text style={viewMode === mode && styles.activeTabText}>
              {mode === 'all' ? '📁 Lamaran' : mode === 'calendar' ? '📅 Agenda' : '👤 Akun'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#4285F4']} // Warna loading Android
            tintColor="#4285F4"  // Warna loading iOS
          />
        }>
        {viewMode === 'all' && (
          <>
            <View style={styles.inputCard}>
              <TextInput placeholder="Nama PT" style={styles.input} value={newCompany} onChangeText={setNewCompany} />
              <TextInput placeholder="Posisi" style={styles.input} value={newPosition} onChangeText={setNewPosition} />
              <TextInput placeholder="Catatan (opsional)" style={styles.input} value={newNotes} onChangeText={setNewNotes} />
              <TouchableOpacity style={styles.addButton} onPress={() => {
                if (!newCompany || !newPosition) return Alert.alert("Eits!", "Isi Nama PT & Posisi dulu.");
                api.addApplication(session.access_token, {
                  user_id: session.user.id,
                  company_name: newCompany,
                  position: newPosition,
                  status: 'applied',
                  notes: newNotes
                }).then(res => { if(res.ok) { setNewCompany(''); setNewPosition(''); setNewNotes(''); fetchData(); } });
              }}>
                <Text style={styles.buttonText}>+ Tambah Lamaran</Text>
              </TouchableOpacity>
            </View>
            
            {/* Pakai Array.isArray untuk keamanan ekstra */}
            {Array.isArray(applications) && applications.map(item => (
              <AppCard key={item.id} item={item} interviews={interviews || []}
                onStatusPress={(id) => { setSelectedAppId(id); setIsStatusModalVisible(true); }}
                onAddSchedule={(id) => { setSelectedAppId(id); setIsEditMode(false); setIsIntModalVisible(true); }}
                onDelete={(id) => {
  // Lakukan pengecekan platform (Web vs Mobile)
  if (Platform.OS === 'web') {
    // Gunakan fungsi confirm() bawaan browser untuk Web
    const confirmDelete = window.confirm("Hapus lamaran ini? Data akan hilang permanen.");
    if (confirmDelete) {
      api.deleteResource(session.access_token, 'app', id).then(() => fetchData());
    }
  } else {
    // Gunakan Alert Native untuk iOS/Android
    Alert.alert("Hapus?", "Data akan hilang permanen.", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: 'destructive', onPress: async () => {
          await api.deleteResource(session.access_token, 'app', id);
          fetchData();
      }}
    ]);
  }
}}
              />
            ))}
          </>
        )}

        {viewMode === 'calendar' && (
          Array.isArray(interviews) && interviews.length > 0 ? (
            interviews.map(intr => (
              <AgendaCard key={intr.interview?.id || intr.id} data={intr} 
                onEdit={(data) => { setSelectedInt(data); setIsEditMode(true); setIsIntModalVisible(true); }}
                onDelete={(id) => {
                  api.deleteResource(session.access_token, 'int', id).then(() => fetchData());
                }}
              />
            ))
          ) : (
            <Text style={{textAlign:'center', marginTop: 50, color: '#95A5A6'}}>Belum ada jadwal interview.</Text>
          )
        )}

        {viewMode === 'profile' && <ProfileTab session={session} onLogout={handleLogout} />}
      </ScrollView>

      {/* MODALS */}
      <StatusModal visible={isStatusModalVisible} onSelect={async (status) => {
         const res = await api.updateStatus(session.access_token, selectedAppId, status);
         if (res.ok) { setIsStatusModalVisible(false); fetchData(); }
      }} onClose={() => setIsStatusModalVisible(false)} />
      
      <ScheduleModal 
        visible={isIntModalVisible} 
        isEdit={isEditMode} 
        initialData={selectedInt}
        onSave={async (formData) => {
          const payload = { ...formData, application_id: isEditMode ? selectedInt.interview.application_id : selectedAppId };
          await api.saveInterview(session.access_token, selectedInt?.interview?.id, payload, isEditMode);
          setIsIntModalVisible(false); 
          fetchData();
        }}
        onClose={() => setIsIntModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: '#F4F7F9', paddingTop: Platform.OS === 'ios' ? 60 : 40, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5 },
  subHeader: { fontSize: 14, color: '#7F8C8D', marginBottom: 30 },
  content: { width: '92%', maxWidth: 800, flex: 1, alignSelf: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E0E5E9', borderRadius: 12, padding: 4, marginBottom: 15, width: '92%', maxWidth: 800, alignSelf: 'center'},
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.1, shadowRadius: 2 },
  activeTabText: { color: '#4285F4', fontWeight: 'bold' },
  inputCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12, padding: 5 },
  addButton: { backgroundColor: '#4285F4', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F9' },
  loginBtn: { backgroundColor: '#4285F4', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, elevation: 3 }
});