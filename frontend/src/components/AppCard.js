import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AppCard = ({ item, interviews, onStatusPress, onAddSchedule, onDelete }) => {
  const getCardStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'technical/test': return styles.cardBlue;
      case 'approve': return styles.cardGreen;
      case 'rejected':
      case 'ghosted': return styles.cardRed;
      default: return styles.cardStandard;
    }
  };

  // Filter jadwal yang spesifik untuk lamaran ini saja
  const myInterviews = interviews.filter(intr => 
    (intr.interview?.application_id === item.id || intr.application_id === item.id)
  );

  return (
    <View style={[styles.appCard, getCardStyle(item.status)]}>
      <Text style={styles.companyName}>{item.company_name}</Text>
      <Text style={styles.positionText}>{item.position} • {item.status?.toUpperCase()}</Text>
      
      {myInterviews.map((intr, idx) => (
        <View key={idx} style={styles.miniJadwal}>
          <Text style={styles.miniJadwalText}>
            🗓️ {intr.interview?.interview_type || intr.interview_type}: {new Date(intr.interview?.interview_date || intr.interview_date).toLocaleDateString('id-ID')}
          </Text>
        </View>
      ))}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnAction} onPress={() => onStatusPress(item.id)}>
          <Text style={styles.btnTextBlack}>🔄 Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => onAddSchedule(item.id)}>
          <Text style={styles.btnTextBlue}>📅 +Jadwal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appCard: { padding: 16, borderRadius: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardStandard: { backgroundColor: '#fff' },
  cardBlue: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#2196F3' },
  cardGreen: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' },
  cardRed: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#F44336' },
  companyName: { fontSize: 20, fontWeight: 'bold', color: '#34495E' },
  positionText: { fontSize: 13, color: '#7F8C8D', marginBottom: 10 },
  miniJadwal: { backgroundColor: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginTop: 5 },
  miniJadwalText: { fontSize: 11, color: '#2C3E50', fontWeight: '500' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, alignItems: 'center' },
  btnAction: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#DCDFE3', marginLeft: 8 },
  btnTextBlack: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  btnTextBlue: { fontSize: 12, fontWeight: 'bold', color: '#4285F4' },
  deleteBtn: { marginLeft: 15 },
  deleteIcon: { fontSize: 18 }
});

export default AppCard;