import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from './supabase';
import { api } from './src/api';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession(); // WAJIB ADA untuk menangani redirect browser

// IMPORT KOMPONEN MODULAR
import AppCard from './src/components/AppCard';
import AgendaCard from './src/components/AgendaCard';
import ProfileTab from './src/components/ProfileTab';
import StatusModal from './src/components/StatusModal';
import ScheduleModal from './src/components/ScheduleModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // all, calendar, profile
  const [loading, setLoading] = useState(false);

  // Form States (Application)
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Modal States
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isIntModalVisible, setIsIntModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInt, setSelectedInt] = useState(null);

  // --- LOGIKA AUTH (Biar bisa Login) ---
  const redirectTo = AuthSession.makeRedirectUri();

  useEffect(() => {
    // 1. Ambil session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { 
        setSession(session); 
        fetchData(session.access_token); 
      }
    });

    // 2. Pasang Listener (Auto-login/logout kalau status berubah)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createSessionFromUrl = async (url) => {
    const { params } = QueryParams.getQueryParams(url);
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (data.session) {
      setSession(data.session);
      fetchData(data.session.access_token);
    }
  };

  const performOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;

      const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);
      if (res.type === 'success') {
        await createSessionFromUrl(res.url);
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // --- LOGIKA DATA ---
  const fetchData = async (tokenFromLogin = null) => {
    const token = tokenFromLogin || session?.access_token;
    if (!token) return;
    setLoading(true);
    try {
      const apps = await api.getApplications(token);
      const ints = await api.getInterviews(token);
      setApplications(apps);
      setInterviews(ints);
    } catch (err) { 
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleAddApplication = async () => {
    if (!newCompany || !newPosition) return Alert.alert("Isi Nama PT & Posisi!");
    const res = await api.addApplication(session.access_token, {
      user_id: session.user.id,
      company_name: newCompany,
      position: newPosition,
      status: 'applied',
      notes: newNotes
    });
    if (res.ok) { 
      setNewCompany(''); setNewPosition(''); setNewNotes(''); 
      fetchData(); 
    }
  };

  const handleUpdateStatus = async (status) => {
    const res = await api.updateStatus(session.access_token, selectedAppId, status);
    if (res.ok) { setIsStatusModalVisible(false); fetchData(); }
  };

  const handleDelete = async (type, id) => {
    Alert.alert("Hapus?", "Data akan hilang permanen.", [
      { text: "Batal" },
      { text: "Hapus", style: 'destructive', onPress: async () => {
          await api.deleteResource(session.access_token, type, id);
          fetchData();
      }}
    ]);
  };

  // --- RENDER LOGIN ---
  if (!session) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.header}>JobSync 🚀</Text>
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
      <Text style={styles.header}>JobSync 🚀</Text>

      {/* NAVIGATION TABS */}
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

      <ScrollView style={styles.content}>
        {viewMode === 'all' && (
          <>
            <View style={styles.inputCard}>
              <TextInput placeholder="Nama PT" style={styles.input} value={newCompany} onChangeText={setNewCompany} />
              <TextInput placeholder="Posisi" style={styles.input} value={newPosition} onChangeText={setNewPosition} />
              <TextInput placeholder="Catatan (opsional)" style={styles.input} value={newNotes} onChangeText={setNewNotes} />
              <TouchableOpacity style={styles.addButton} onPress={handleAddApplication}><Text style={styles.buttonText}>+ Tambah Lamaran</Text></TouchableOpacity>
            </View>
            {applications.map(item => (
              <AppCard key={item.id} item={item} interviews={interviews}
                onStatusPress={(id) => { setSelectedAppId(id); setIsStatusModalVisible(true); }}
                onAddSchedule={(id) => { setSelectedAppId(id); setIsEditMode(false); setIsIntModalVisible(true); }}
                onDelete={(id) => handleDelete('app', id)} 
              />
            ))}
          </>
        )}

        {viewMode === 'calendar' && (
          interviews.length > 0 ? (
            interviews.map(intr => (
              <AgendaCard key={intr.interview?.id || intr.id} data={intr} 
                onEdit={(data) => { setSelectedInt(data); setIsEditMode(true); setIsIntModalVisible(true); }}
                onDelete={(id) => handleDelete('int', id)}
              />
            ))
          ) : (
            <Text style={{textAlign:'center', marginTop: 20, color: '#95A5A6'}}>Belum ada jadwal interview.</Text>
          )
        )}

        {viewMode === 'profile' && <ProfileTab session={session} onLogout={handleLogout} />}
      </ScrollView>

      {/* MODALS */}
      <StatusModal visible={isStatusModalVisible} onSelect={handleUpdateStatus} onClose={() => setIsStatusModalVisible(false)} />
      
      <ScheduleModal 
        visible={isIntModalVisible} 
        isEdit={isEditMode} 
        initialData={selectedInt}
        onSave={async (formData) => {
          // application_id dikirim dari selectedAppId (saat tambah) atau dari initialData (saat edit)
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
  container: { flex: 1, backgroundColor: '#F4F7F9', paddingTop: 60, alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5 },
  subHeader: { fontSize: 14, color: '#7F8C8D', marginBottom: 30 },
  content: { width: '92%', flex: 1 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E0E5E9', borderRadius: 12, padding: 4, marginBottom: 15, width: '92%' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', elevation: 2 },
  activeTabText: { color: '#4285F4', fontWeight: 'bold' },
  inputCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12, padding: 5 },
  addButton: { backgroundColor: '#4285F4', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F9' },
  loginBtn: { backgroundColor: '#4285F4', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, elevation: 3 }
});