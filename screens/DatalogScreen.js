import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
 
// Table Row 
const LogRow = ({ item, index }) => {
  const d = new Date(item.timestamp * 1000);
  const timeStr = `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
 
  return (
    <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
      <Text style={[styles.cell, styles.cellTime]}>{timeStr}</Text>
      <Text style={[styles.cell, { color: '#ea4335' }]}>
        {item.temperature !== null ? `${item.temperature.toFixed(1)}°` : '—'}
      </Text>
      <Text style={[styles.cell, { color: '#4285f4' }]}>
        {item.humidity !== null ? `${item.humidity.toFixed(1)}%` : '—'}
      </Text>
      <Text style={[styles.cell, { color: '#34a853' }]}>
        {item.soil_moisture !== null ? `${item.soil_moisture}%` : '—'}
      </Text>
      <Text style={[styles.cell, { color: '#fbbc04' }]}>
        {item.light_level !== null ? `${item.light_level}%` : '—'}
      </Text>
    </View>
  );
};

// Main Screen

export default function DataLogScreen() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sortDesc, setSortDesc] = useState(true); // newest first
 
  useEffect(() => {
    const readingsRef = ref(db, 'farms/busia/readings');
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.values(data).map((r) => ({
          temperature:   r.temperature   ?? null,
          humidity:      r.humidity      ?? null,
          soil_moisture: r.soil_moisture ?? null,
          light_level:   r.light_level   ?? null,
          timestamp:     r.timestamp     ?? 0,
        }));
        parsed.sort((a, b) => sortDesc
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp
        );
        setReadings(parsed);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sortDesc]);
 
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34a853" />
        <Text style={styles.loadingText}>Loading data log...</Text>
      </View>
    );
  }
 
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Data Log</Text>
          <Text style={styles.headerSub}>
            {readings.length} readings collected
          </Text>
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortDesc(!sortDesc)}
        >
          <Text style={styles.sortText}>
            {sortDesc ? '↓ Newest' : '↑ Oldest'}
          </Text>
        </TouchableOpacity>
      </View>
 
      {readings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyTitle}>No readings logged yet</Text>
          <Text style={styles.emptyText}>
            Every reading from the ESP32 will be recorded here with a timestamp.
            This log forms the dataset for the future AI advisory system.
          </Text>
        </View>
      ) : (
        <>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellTime]}>Time</Text>
            <Text style={[styles.headerCell, { color: '#ea4335' }]}>Temp</Text>
            <Text style={[styles.headerCell, { color: '#4285f4' }]}>Hum</Text>
            <Text style={[styles.headerCell, { color: '#34a853' }]}>Soil</Text>
            <Text style={[styles.headerCell, { color: '#fbbc04' }]}>Light</Text>
          </View>
 
          <FlatList
            data={readings}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => <LogRow item={item} index={index} />}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}
 
// Styles 
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f7fa' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 15 },
 
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   '#fff',
    padding:           20,
    paddingTop:        50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  headerSub:   { fontSize: 13, color: '#666', marginTop: 2 },
 
  sortBtn: {
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      8,
  },
  sortText: { color: '#34a853', fontWeight: '600', fontSize: 13 },
 
  tableHeader: {
    flexDirection:     'row',
    backgroundColor:   '#fff',
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  headerCell: { flex: 1, fontWeight: '700', fontSize: 12, textAlign: 'center' },
 
  row: {
    flexDirection:     'row',
    paddingHorizontal: 12,
    paddingVertical:   10,
    backgroundColor:   '#fff',
  },
  rowAlt: { backgroundColor: '#fafafa' },
  cell: {
    flex: 1, fontSize: 12,
    textAlign: 'center', color: '#333',
  },
  cellTime: { flex: 1.4, color: '#666', fontSize: 11 },
 
  emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptyText:  { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
});
