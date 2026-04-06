import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ProfileTab = ({ session, onLogout }) => {
  // 1. Ekstrak data user dari session Supabase
  const user = session?.user;
  console.log("KADO DARI GOOGLE:", JSON.stringify(session?.user?.user_metadata, null, 2));
console.log("INFO SISTEM SUPABASE:", session?.user);
  
  // 2. Ekstrak metadata bawaan dari Google OAuth
  const metadata = user?.user_metadata || {};
  
  // 3. Ambil Nama, Email, dan Foto Profil Google
  const fullName = metadata.full_name || 'Pengguna JobSync';
  const email = user?.email || 'Email tidak tersedia';
  // Fallback ke ui-avatars kalau Google tidak kasih foto
  const avatarUrl = metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* FOTO PROFIL GOOGLE */}
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
        />
        
        {/* NAMA DAN EMAIL GOOGLE */}
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.divider} />

        <Text style={styles.infoTitle}>Informasi Akun</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          {/* Menampilkan ID unik dari Supabase (UUID) */}
          <Text style={styles.infoValue}>{user?.id.substring(0, 8)}...</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Keluar (Logout)</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, alignItems: 'center' },
  card: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, backgroundColor: '#EDF0F2' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5 },
  email: { fontSize: 14, color: '#7F8C8D', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#EDF0F2', width: '100%', marginVertical: 15 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', color: '#2C3E50', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  infoLabel: { color: '#7F8C8D' },
  infoValue: { color: '#34495E', fontWeight: '500' },
  logoutBtn: { 
    marginTop: 20, 
    backgroundColor: '#FFEAEA', 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  logoutText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileTab;