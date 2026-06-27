import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl
} from 'react-native'

//Sensor Card
const SensorCard = ({ title, value, unit, icon, color, subtitle }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={[styles.cardValue, { color }]}>
      {value !== null && value !== undefined ? `${value}` : '—'}
      <Text style={styles.cardUnit}> {unit}</Text>
    </Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </View>
);

// Status Badge
const StatusBadge = ({ connected }) => (
  <View style={[styles.badge, { backgroundColor: connected ? '#e6f4ea' : '#fce8e6' }]}>
    <View style={[styles.badgeDot, { backgroundColor: connected ? '#34a853' : '#ea4335' }]} />
    <Text style={[styles.badgeText, { color: connected ? '#34a853' : '#ea4335' }]}>
      {connected ? 'Live' : 'No Data'}
    </Text>
  </View>
);

// Main Screen
export default function HomeScreen() {
  const [latestReading, setLatestReading] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [refreshing, setRefreshing]       = useState(false);
 
  useEffect(() => {
    const readingsRef = ref(db, 'farms/busia/readings');
 
    // Real-time listener — updates instantly when ESP32 sends new data
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get the most recent reading (last key by timestamp)
        const keys   = Object.keys(data);
        const lastKey = keys[keys.length - 1];
        setLatestReading(data[lastKey]);
        setLastUpdated(new Date().toLocaleTimeString());
      }
      setLoading(false);
      setRefreshing(false);
    });
 
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
 
  const onRefresh = () => setRefreshing(true);
 
// Helpers for status labels
 const soilStatus = (pct) => {
    if (pct === null) return 'No reading';
    if (pct < 30) return 'Dry — consider irrigating';
    if (pct < 70) return 'Optimal moisture';
    return 'Wet — good drainage needed';
  };
 
  const lightStatus = (pct) => {
    if (pct === null) return 'No reading';
    if (pct < 20) return 'Low light';
    if (pct < 60) return 'Moderate light';
    return 'Bright — good for crops';
  };
 
  const tempStatus = (temp) => {
    if (temp === null) return 'No reading';
    if (temp < 15) return 'Too cold for most crops';
    if (temp < 30) return 'Optimal temperature';
    return 'High — watch for heat stress';
  };
 
  const humidStatus = (hum) => {
    if (hum === null) return 'No reading';
    if (hum < 40) return 'Low humidity';
    if (hum < 70) return 'Comfortable range';
    return 'High — watch for fungal risk';
  };

// Render
if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34a853" />
        <Text style={styles.loadingText}>Connecting to farm sensors...</Text>
      </View>
    );
  }
 
  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart Farm Dashboard</Text>
          <Text style={styles.headerSub}>Busia County, Kenya</Text>
        </View>
        <StatusBadge connected={!!latestReading} />
      </View>
 
      {lastUpdated && (
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
      )}
 
      {/* No data state */}
      {!latestReading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyTitle}>Waiting for sensor data</Text>
          <Text style={styles.emptyText}>
            Once your ESP32 is connected and running, live readings will appear here automatically.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Live Readings</Text>
 
          <SensorCard
            title="Temperature"
            value={latestReading.temperature?.toFixed(1)}
            unit="°C"
            icon="🌡️"
            color="#ea4335"
            subtitle={tempStatus(latestReading.temperature)}
          />
          <SensorCard
            title="Humidity"
            value={latestReading.humidity?.toFixed(1)}
            unit="%"
            icon="💧"
            color="#4285f4"
            subtitle={humidStatus(latestReading.humidity)}
          />
          <SensorCard
            title="Soil Moisture"
            value={latestReading.soil_moisture}
            unit="%"
            icon="🌱"
            color="#34a853"
            subtitle={soilStatus(latestReading.soil_moisture)}
          />
          <SensorCard
            title="Light Level"
            value={latestReading.light_level}
            unit="%"
            icon="☀️"
            color="#fbbc04"
            subtitle={lightStatus(latestReading.light_level)}
          />
        </>
      )}
 
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f7fa' },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText:   { marginTop: 12, color: '#666', fontSize: 15 },
 
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: '#fff',
    padding:         20,
    paddingTop:      50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  headerSub:    { fontSize: 13, color: '#666', marginTop: 2 },
 
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:   20,
  },
  badgeDot:  { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
 
  lastUpdated:  { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', margin: 16, marginBottom: 8 },
 
  card: {
    backgroundColor: '#fff',
    borderRadius:    12,
    padding:         16,
    marginHorizontal: 16,
    marginVertical:   8,
    borderLeftWidth:  4,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    6,
    elevation:       2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon:   { fontSize: 20, marginRight: 8 },
  cardTitle:  { fontSize: 14, color: '#666', fontWeight: '500' },
  cardValue:  { fontSize: 36, fontWeight: '700' },
  cardUnit:   { fontSize: 16, fontWeight: '400', color: '#999' },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 4 },
 
  emptyState: {
    alignItems:  'center',
    padding:     40,
    marginTop:   40,
  },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptyText:  { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
});

