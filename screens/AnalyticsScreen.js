// screens/AnalyticsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Dimensions, TouchableOpacity
} from 'react-native';
import { fetchReadings } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;
const FILTERS = ['1H', '6H', '24H', '7D'];

const ChartCard = ({ title, icon, color, data, labels, unit }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartIcon}>{icon}</Text>
          <Text style={styles.chartTitle}>{title}</Text>
        </View>
        <View style={styles.noDataBox}>
          <Text style={styles.noDataText}>No historical data yet</Text>
          <Text style={styles.noDataSub}>Charts will appear once ESP32 starts sending data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartIcon}>{icon}</Text>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={[styles.chartLatest, { color }]}>{data[data.length - 1]}{unit}</Text>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data, color: () => color, strokeWidth: 2 }] }}
        width={screenWidth}
        height={180}
        yAxisSuffix={unit}
        chartConfig={{
          backgroundColor: '#fff', backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff', decimalPlaces: 1,
          color: () => color, labelColor: () => '#999',
          propsForDots: { r: '3', strokeWidth: '1', stroke: color },
          propsForBackgroundLines: { stroke: '#f0f0f0' },
        }}
        bezier
        style={{ borderRadius: 8, marginTop: 8 }}
      />
    </View>
  );
};

export default function AnalyticsScreen() {
  const [readings, setReadings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setFilter] = useState('24H');

  const loadData = useCallback(async () => {
    const data = await fetchReadings();
    setReadings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filterReadings = (data) => {
    const now = Date.now() / 1000;
    const windows = { '1H': 3600, '6H': 21600, '24H': 86400, '7D': 604800 };
    const filtered = data.filter((r) => r.timestamp >= now - windows[activeFilter]);
    if (filtered.length <= 12) return filtered;
    const step = Math.floor(filtered.length / 12);
    return filtered.filter((_, i) => i % step === 0).slice(0, 12);
  };

  const toLabels = (data) =>
    data.map((r) => {
      const d = new Date(r.timestamp * 1000);
      return activeFilter === '7D'
        ? `${d.getDate()}/${d.getMonth() + 1}`
        : `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

  const filtered = filterReadings(readings);
  const labels   = toLabels(filtered);
  const extract  = (key) => filtered.map((r) => parseFloat((r[key] ?? 0).toFixed(1)));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34a853" />
        <Text style={styles.loadingText}>Loading historical data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Historical sensor trends</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {readings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No data collected yet</Text>
          <Text style={styles.emptyText}>
            Connect your ESP32 and start collecting data. Charts will populate automatically.
          </Text>
        </View>
      ) : (
        <>
          <ChartCard title="Temperature" icon="🌡️" color="#ea4335" unit="°C" data={extract('temperature')} labels={labels} />
          <ChartCard title="Humidity"    icon="💧" color="#4285f4" unit="%" data={extract('humidity')}    labels={labels} />
          <ChartCard title="Soil Moisture" icon="🌱" color="#34a853" unit="%" data={extract('soil_moisture')} labels={labels} />
          <ChartCard title="Light Level" icon="☀️" color="#fbbc04" unit="%" data={extract('light_level')} labels={labels} />
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f7fa' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 15 },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  headerSub:   { fontSize: 13, color: '#666', marginTop: 2 },
  filterRow: {
    flexDirection: 'row', margin: 16,
    backgroundColor: '#fff', borderRadius: 10, padding: 4,
  },
  filterBtn:       { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  filterBtnActive: { backgroundColor: '#34a853' },
  filterText:      { fontSize: 13, color: '#666', fontWeight: '600' },
  filterTextActive:{ color: '#fff' },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  chartHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chartIcon:    { fontSize: 18, marginRight: 8 },
  chartTitle:   { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  chartLatest:  { fontSize: 18, fontWeight: '700' },
  noDataBox: {
    alignItems: 'center', paddingVertical: 30,
    backgroundColor: '#f9f9f9', borderRadius: 8, marginTop: 8,
  },
  noDataText: { fontSize: 14, color: '#999', fontWeight: '500' },
  noDataSub:  { fontSize: 12, color: '#bbb', marginTop: 4, textAlign: 'center' },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptyText:  { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
});