import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; // <--- PASTIKAN ADA StyleSheet
import { COLORS } from '../constants/theme';

const AgendaCard = ({ data, onEdit, onDelete }) => {
  // Pastikan destructuring-nya bener sesuai hasil JOIN backend
  const { interview, company_name, position } = data;

  return (
    <View style={styles.agendaCard}> 
      <View style={styles.agendaDateBox}>
        <Text style={styles.agendaDay}>{new Date(interview.interview_date).getDate()}</Text>
        <Text style={styles.agendaMonth}>
          {new Date(interview.interview_date).toLocaleString('id-ID', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.agendaInfo}>
        <Text style={styles.agendaCompany}>{company_name}</Text>
        <Text style={styles.agendaPos}>{position}</Text>
        <Text style={styles.agendaTime}>🕒 {new Date(interview.interview_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {interview.interview_type.toUpperCase()}</Text>
        <Text style={styles.agendaLoc}>📍 {interview.location}</Text>
        {interview.notes ? <Text style={styles.agendaNotes}>📝 {interview.notes}</Text> : null}
        
        <View style={styles.agendaActionRow}>
          <TouchableOpacity onPress={() => onEdit(data)}>
            <Text style={styles.editText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(interview.id)}>
            <Text style={styles.deleteText}>🗑️ Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- INI BAGIAN YANG SERING KETINGGALAN ---
const styles = StyleSheet.create({
  agendaCard: { 
    backgroundColor: COLORS.white, 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12, 
    elevation: 2 
  },
  agendaDateBox: { 
    backgroundColor: COLORS.primary, 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    minWidth: 55 
  },
  agendaDay: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  agendaMonth: { color: COLORS.white, fontSize: 12, textTransform: 'uppercase' },
  agendaInfo: { marginLeft: 15, flex: 1 },
  agendaCompany: { fontWeight: 'bold', fontSize: 17, color: COLORS.textMain },
  agendaPos: { fontSize: 13, color: COLORS.textSub },
  agendaTime: { color: '#1565C0', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  agendaLoc: { fontSize: 12, color: '#444', marginTop: 2 },
  agendaNotes: { fontSize: 11, color: '#777', marginTop: 2, fontStyle: 'italic' },
  agendaActionRow: { 
    flexDirection: 'row', 
    marginTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 8 
  },
  editText: { color: COLORS.primary, fontWeight: 'bold' },
  deleteText: { color: COLORS.dangerBorder, fontWeight: 'bold', marginLeft: 20 },
});

export default AgendaCard;