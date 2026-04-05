import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const ProfileTab = ({ session, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}><Text style={styles.avatarText}>F</Text></View>
      <Text style={styles.name}>Fasich Aulia</Text>
      <Text style={styles.email}>{session.user.email}</Text>
      <Text style={styles.sub}>B.Sc. in Informatics Engineering</Text>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.textMain },
  email: { fontSize: 14, color: COLORS.textSub, marginTop: 5 },
  sub: { fontSize: 14, color: '#95A5A6', marginTop: 2 },
  logoutBtn: { marginTop: 40, backgroundColor: COLORS.dangerBorder, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  logoutText: { color: '#fff', fontWeight: 'bold' }
});

export default ProfileTab;