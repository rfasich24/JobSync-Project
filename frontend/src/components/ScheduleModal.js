import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';

const ScheduleModal = ({ visible, isEdit, initialData, onSave, onClose }) => {
  const [type, setType] = useState('technical test');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  useEffect(() => {
    if (isEdit && initialData) {
      setType(initialData.interview.interview_type);
      setLocation(initialData.interview.location);
      setNotes(initialData.interview.notes);
      setDate(new Date(initialData.interview.interview_date));
    } else {
      setType('technical test'); setLocation(''); setNotes(''); setDate(new Date());
    }
  }, [isEdit, initialData, visible]);

  const handleSave = () => {
    onSave({ interview_type: type, location, notes, interview_date: date.toISOString() });
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
                <Text style={type === t && {color: '#fff'}}>{t === 'interviews' ? 'Interview' : 'Tech Test'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={styles.dtBtn} onPress={() => {setMode('date'); setShowPicker(true)}}><Text>📅 {date.toLocaleDateString()}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.dtBtn} onPress={() => {setMode('time'); setShowPicker(true)}}><Text>🕒 {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text></TouchableOpacity>
          </View>
          {showPicker && <DateTimePicker value={date} mode={mode} is24Hour onChange={(e, d) => {setShowPicker(false); if(d) setDate(d)}} />}
          <TextInput placeholder="Lokasi" style={styles.input} value={location} onChangeText={setLocation} />
          <TextInput placeholder="Catatan" style={styles.input} value={notes} onChangeText={setNotes} />
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={{color:'#fff'}}>Batal</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={{color:'#fff'}}>Simpan</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '88%', backgroundColor: '#fff', padding: 25, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  typeBtn: { flex: 0.48, padding: 12, backgroundColor: COLORS.grayLight, borderRadius: 10, alignItems: 'center' },
  activeType: { backgroundColor: COLORS.primary },
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dtBtn: { flex: 0.48, padding: 12, backgroundColor: COLORS.grayLight, borderRadius: 10, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#EDF0F2', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#F9FAFB' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelBtn: { backgroundColor: '#BDC3C7', padding: 15, borderRadius: 12, flex: 0.45, alignItems: 'center' },
  saveBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, flex: 0.45, alignItems: 'center' },
});

export default ScheduleModal;