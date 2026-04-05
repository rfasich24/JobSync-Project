import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const StatusModal = ({ visible, onSelect, onClose }) => {
  const statuses = ['applied', 'technical/test', 'approve', 'rejected', 'ghosted'];
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Pilih Status Baru</Text>
          {statuses.map(s => (
            <TouchableOpacity key={s} style={styles.item} onPress={() => onSelect(s)}>
              <Text style={styles.text}>{s.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} style={{marginTop: 15}}><Text style={styles.close}>Tutup</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '85%', backgroundColor: '#fff', padding: 25, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  item: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  text: { textAlign: 'center', fontWeight: '600', color: COLORS.textMain },
  close: { textAlign: 'center', color: COLORS.dangerBorder, fontWeight: 'bold' }
});

export default StatusModal;