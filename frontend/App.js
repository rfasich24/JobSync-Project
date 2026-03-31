import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase'; // Import file yang baru kita buat

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [session, setSession] = useState(null);

  // Buat URL kembalian otomatis ke aplikasi JobSync
  const redirectTo = AuthSession.makeRedirectUri();

  // Fungsi untuk menangkap token setelah Google -> Supabase selesai
  const createSessionFromUrl = async (url) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;
    setSession(data.session);
    console.log("BINGO! User ID:", data.session.user.id);
    Alert.alert("Berhasil Login!", `Email: ${data.session.user.email}`);
  };

  // Fungsi utama untuk memicu login
  const performOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Biarkan React Native yang buka browser
        },
      });

      if (error) throw error;

      // Buka browser internal untuk login Google
      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
      );

      if (res.type === 'success') {
        const { url } = res;
        await createSessionFromUrl(url);
      }
    } catch (error) {
      console.error("OAuth Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JobSync 🚀</Text>
      
      {session ? (
        <View style={styles.profileBox}>
          <Text style={styles.text}>Halo, {session.user.email}!</Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FF3B30', marginTop: 10 }]} 
            onPress={() => setSession(null)}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={performOAuth}>
          <Text style={styles.buttonText}>Sign in with Google via Supabase</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#4285F4', padding: 15, borderRadius: 8, paddingHorizontal: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  profileBox: { alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#eee', borderRadius: 10 },
  text: { fontSize: 16, marginBottom: 10 }
});