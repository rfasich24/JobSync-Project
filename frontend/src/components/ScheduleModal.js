import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';

const ScheduleModal = ({ visible, isEdit, initialData, onSave, onClose }) => {
  const [type, setType] = useState('technical test');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // States untuk Waktu
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(''); // State baru untuk jam
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setType(initialData.interview.interview_type);
      setLocation(initialData.interview.location);
      setNotes(initialData.interview.notes);
      
      const initDate = new Date(initialData.interview.interview_date);
      setDate(initDate);
      
      // Ambil jam (format HH:mm) dari database jika ada
      const hours = initDate.getHours().toString().padStart(2, '0');
      const minutes = initDate.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    } else {
      setType('technical test'); 
      setLocation(''); 
      setNotes(''); 
      setDate(new Date());
      setTime('');
    }
  }, [isEdit, initialData, visible]);

  const handleSave = () => {
    // Gabungkan input Tanggal dan input Jam sebelum disimpan
    let finalDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      if (hours && minutes) {
        finalDate.setHours(parseInt(hours, 10));
        finalDate.setMinutes(parseInt(minutes, 10));
      }
    }
    
    onSave({ 
      interview_type: type, 
      location, 
      notes, 
      interview_date: finalDate.toISOString() 
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}</Text>
          
          <View style={styles.typeRow}>
            {['technical test', 'interviews'].map(t => (
              <TouchableOpacity key={t} disabled={isEdit} 
                style={[styles.typeBtn, type === t && styles.activeType, isEdit && {opacity:0.5}]}
                onPress={() => setType(t)}>
                <Text style={type === t ? {color: '#fff', fontWeight: 'bold'} : {color: '#333'}}>
                  {t === 'interviews' ? 'Interview' : 'Tech Test'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BARIS TANGGAL & JAM */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.label}>Tgl Interview</Text>
              
              {Platform.OS === 'web' ? (
                /* RENDER UNTUK WEB (Menggunakan HTML5 Input) */
                <input 
                  type="date"
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#EDF0F2',
                    borderRadius: 10,
                    width: '100%',
                    fontSize: 14,
                    backgroundColor: '#F9FAFB',
                    outline: 'none'
                  }}
                  value={date.toISOString().split('T')[0]} 
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if(!isNaN(newDate.getTime())) setDate(newDate);
                  }}
                />
              ) : (
                /* RENDER UNTUK MOBILE (iOS/Android) */
                <TouchableOpacity 
                  style={styles.input} 
                  onPress={() => setShowPicker(true)}>
                  <Text>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}

              {/* Komponen Native Picker */}
              {Platform.OS !== 'web' && showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={{flex: 1}}>
              <Text style={styles.label}>Jam (opsional)</Text>
              <TextInput 
                style={styles.input} 
                value={time} 
                onChangeText={setTime} 
                placeholder="09:00" 
              />
            </View>
          </View>

          <Text style={styles.label}>Lokasi / Link Meeting</Text>
          <TextInput placeholder="Gmeet / Alamat Kantor" style={styles.input} value={location} onChangeText={setLocation} />
          
          <Text style={styles.label}>Catatan</Text>
          <TextInput placeholder="Bawa laptop, dll..." style={styles.input} value={notes} onChangeText={setNotes} />
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{color:'#fff', fontWeight: 'bold'}}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={{color:'#fff', fontWeight: 'bold'}}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '88%', backgroundColor: '#fff', padding: 25, borderRadius: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2C3E50' },
  label: { fontSize: 12, color: '#7F8C8D', marginBottom: 5, marginLeft: 2 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeBtn: { flex: 0.48, padding: 12, backgroundColor: COLORS.grayLight, borderRadius: 10, alignItems: 'center' },
  activeType: { backgroundColor: COLORS.primary },
  input: { borderWidth: 1, borderColor: '#EDF0F2', borderRadius: 10, padding: 12, backgroundColor: '#F9FAFB' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelBtn: { backgroundColor: '#BDC3C7', padding: 15, borderRadius: 12, flex: 0.45, alignItems: 'center' },
  saveBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, flex: 0.45, alignItems: 'center' }
});

export default ScheduleModal;