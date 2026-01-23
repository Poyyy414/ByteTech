import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, StatusBar, 
  Dimensions, ScrollView, Platform 
} from 'react-native';
// Standardize imports to prevent AIRMapMarker registration errors
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Icons from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Naga City Center Coordinates
const CENTER_COORD = { latitude: 13.6218, longitude: 123.1948 };

// Complete Naga City Barangay Data
const NAGA_BARANGAYS = [
  { id: 1, name: 'Abella', latitude: 13.6210, longitude: 123.1850, density: 'High', temp: '36°C' },
  { id: 2, name: 'Bagumbayan Norte', latitude: 13.6280, longitude: 123.1850, density: 'Low', temp: '32°C' },
  { id: 3, name: 'Bagumbayan Sur', latitude: 13.6200, longitude: 123.1800, density: 'High', temp: '35°C' },
  { id: 4, name: 'Balatas', latitude: 13.6300, longitude: 123.2050, density: 'High', temp: '34°C' },
  { id: 5, name: 'Calauag', latitude: 13.6350, longitude: 123.1950, density: 'Low', temp: '31°C' },
  { id: 6, name: 'Cararayan', latitude: 13.6400, longitude: 123.2300, density: 'High', temp: '35°C' },
  { id: 7, name: 'Carolina', latitude: 13.6700, longitude: 123.2800, density: 'Low', temp: '29°C' },
  { id: 8, name: 'Concepcion Grande', latitude: 13.6150, longitude: 123.2100, density: 'High', temp: '36°C' },
  { id: 9, name: 'Concepcion Pequeña', latitude: 13.6200, longitude: 123.2000, density: 'High', temp: '35°C' },
  { id: 10, name: 'Dayangdang', latitude: 13.6250, longitude: 123.1900, density: 'Low', temp: '32°C' },
  { id: 11, name: 'Del Rosario', latitude: 13.6174, longitude: 123.2372, density: 'High', temp: '34°C' },
  { id: 12, name: 'Dinaga', latitude: 13.6220, longitude: 123.1880, density: 'High', temp: '36°C' },
  { id: 13, name: 'Igualdad Interior', latitude: 13.6190, longitude: 123.1860, density: 'Low', temp: '33°C' },
  { id: 14, name: 'Lerma', latitude: 13.6240, longitude: 123.1840, density: 'Low', temp: '32°C' },
  { id: 15, name: 'Liboton', latitude: 13.6300, longitude: 123.1880, density: 'Low', temp: '31°C' },
  { id: 16, name: 'Mabolo', latitude: 13.6100, longitude: 123.1800, density: 'High', temp: '35°C' },
  { id: 17, name: 'Pacol', latitude: 13.6550, longitude: 123.2500, density: 'Low', temp: '30°C' },
  { id: 18, name: 'Panicuason', latitude: 13.6700, longitude: 123.3200, density: 'Low', temp: '28°C' },
  { id: 19, name: 'Peñafrancia', latitude: 13.6330, longitude: 123.1920, density: 'Low', temp: '32°C' },
  { id: 20, name: 'Sabang', latitude: 13.6150, longitude: 123.1820, density: 'High', temp: '36°C' },
  { id: 21, name: 'San Felipe', latitude: 13.6400, longitude: 123.2050, density: 'High', temp: '34°C' },
  { id: 22, name: 'San Francisco', latitude: 13.6250, longitude: 123.1870, density: 'Low', temp: '33°C' },
  { id: 23, name: 'San Isidro', latitude: 13.6329, longitude: 123.2699, density: 'Low', temp: '31°C' },
  { id: 24, name: 'Santa Cruz', latitude: 13.6280, longitude: 123.1800, density: 'Low', temp: '32°C' },
  { id: 25, name: 'Tabuco', latitude: 13.6180, longitude: 123.1880, density: 'High', temp: '36°C' },
  { id: 26, name: 'Tinago', latitude: 13.6260, longitude: 123.1890, density: 'Low', temp: '32°C' },
  { id: 27, name: 'Triangulo', latitude: 13.6100, longitude: 123.1950, density: 'High', temp: '35°C' },
];

const SafeIcon = ({ name, size = 24, color = "#000", ...props }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <View style={{ width: size, height: size, backgroundColor: '#eee' }} />;
  return <IconComponent size={size} color={color} {...props} />;
};

// --- ANALYTICS DASHBOARD ---
const DashboardScreen = () => (
  <ScrollView style={styles.scrollContainer}>
    <Text style={styles.screenTitle}>ENVI Analytics</Text>
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <SafeIcon name="Thermometer" color="#FF6B6B" />
        <Text style={styles.statValue}>670</Text>
        <Text style={styles.statLabel}>Heat Stress Cases</Text>
      </View>
      <View style={styles.statCard}>
        <SafeIcon name="Cloud" color="#E58E6D" />
        <Text style={styles.statValue}>120</Text>
        <Text style={styles.statLabel}>Emission Tons (Top 20%)</Text>
      </View>
      <View style={styles.statCard}>
        <SafeIcon name="ClipboardCheck" color="#5F9EA0" />
        <Text style={styles.statValue}>45%</Text>
        <Text style={styles.statLabel}>Inspection Drop</Text>
      </View>
      <View style={styles.statCard}>
        <SafeIcon name="Users" color="#6CAE75" />
        <Text style={styles.statValue}>8932</Text>
        <Text style={styles.statLabel}>Active Users</Text>
      </View>
    </View>
    <View style={styles.chartPlaceholder}>
      <Text style={styles.statLabel}>Top 5 Barangays by Carbon Emission</Text>
      {[265, 255, 250, 195, 190].map((val, i) => (
        <View key={i} style={[styles.bar, { width: val * 0.8, backgroundColor: i < 2 ? '#E85D5D' : '#FDB813' }]} />
      ))}
    </View>
  </ScrollView>
);

const MapScreen = () => {
  const [currentTab, setCurrentTab] = useState('Map');
  const [selectedBrgy, setSelectedBrgy] = useState(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <View style={{ flex: 1 }}>
        {currentTab === 'Map' && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{ ...CENTER_COORD, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
          >
            {NAGA_BARANGAYS.map((brgy) => (
              <Marker 
                key={brgy.id}
                coordinate={{ latitude: brgy.latitude, longitude: brgy.longitude }}
                onPress={() => setSelectedBrgy(brgy)}
              >
                <SafeIcon 
                  name="AlertTriangle" 
                  size={30} 
                  color={brgy.density === 'High' ? '#D64545' : '#6CAE75'} 
                  fill={brgy.density === 'High' ? '#E85D5D' : '#A8D5BA'} 
                />
              </Marker>
            ))}
          </MapView>
        )}
        {currentTab === 'Dashboard' && <DashboardScreen />}
        {currentTab === 'Reports' && <View style={styles.center}><Text>Barangay Level Reports</Text></View>}
        {currentTab === 'Establishment' && <View style={styles.center}><Text>Establishment Data</Text></View>}
      </View>

      {/* Floating Info Card (Barangay Selection) */}
      {currentTab === 'Map' && selectedBrgy && (
        <View style={styles.selectionOverlay}>
          <View style={styles.calloutBubble}>
            <Text style={styles.calloutTitle}>{selectedBrgy.name}</Text>
            <View style={styles.calloutTempRow}>
                <SafeIcon name="Thermometer" size={24} color="#FF6B6B" />
                <Text style={styles.calloutTempText}>{selectedBrgy.temp}</Text>
            </View>
            <View style={styles.calloutDataRow}>
              <SafeIcon name="Leaf" size={16} color={selectedBrgy.density === 'High' ? '#D64545' : '#6CAE75'} />
              <Text style={{ fontWeight: 'bold', marginLeft: 5, color: selectedBrgy.density === 'High' ? '#D64545' : '#3B6E4A' }}>
                Carbon Density: {selectedBrgy.density}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedBrgy(null)} style={styles.closeBtn}>
              <Text style={{color: '#999'}}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TabItem active={currentTab === 'Map'} label="Map" name="Map" onPress={() => setCurrentTab('Map')} />
        <TabItem active={currentTab === 'Dashboard'} label="Dashboard" name="LayoutDashboard" onPress={() => setCurrentTab('Dashboard')} />
        <TabItem active={currentTab === 'Reports'} label="Reports" name="FileText" onPress={() => setCurrentTab('Reports')} />
        <TabItem active={currentTab === 'Establishment'} label="Establishment" name="Building2" onPress={() => setCurrentTab('Establishment')} />
      </View>
    </View>
  );
};

const TabItem = ({ active, label, name, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <SafeIcon name={name} color={active ? '#3B6E4A' : '#999'} />
    <Text style={[styles.tabLabel, { color: active ? '#3B6E4A' : '#999' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F7' },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flex: 1, padding: 20, paddingTop: 60 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { backgroundColor: 'white', width: '48%', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { fontSize: 12, color: '#666' },
  chartPlaceholder: { marginTop: 10, padding: 15, backgroundColor: 'white', borderRadius: 15 },
  bar: { height: 10, borderRadius: 5, marginVertical: 4 },
  selectionOverlay: { position: 'absolute', bottom: 120, left: 20, right: 20 },
  calloutBubble: { backgroundColor: 'white', borderRadius: 16, padding: 15, elevation: 5 },
  calloutTitle: { fontSize: 18, fontWeight: 'bold' },
  calloutTempRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  calloutTempText: { fontSize: 24, fontWeight: 'bold', marginLeft: 5 },
  calloutDataRow: { flexDirection: 'row', alignItems: 'center' },
  closeBtn: { marginTop: 10, alignSelf: 'flex-end' },
  bottomTabBar: { flexDirection: 'row', backgroundColor: 'white', height: 85, borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4 }
});

export default MapScreen;