import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, StatusBar, 
  Dimensions, ActivityIndicator 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Icons from 'lucide-react-native';
import { API_URL } from './config';

// Screen Imports
import DashboardScreen from './dashboard';
import ReportsScreen from './reports';
import EstablishmentScreen from './establishment';

const { width } = Dimensions.get('window');

const NAGA_CITY_CENTER = {
  latitude: 13.6218,
  longitude: 123.1948,
  latitudeDelta: 0.05, 
  longitudeDelta: 0.05,
};

const SafeIcon = ({ name, size = 24, color = "#000" }) => {
  const IconComponent = Icons[name];
  return IconComponent ? <IconComponent size={size} color={color} /> : <View />;
};

const TabItem = ({ active, label, name, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <SafeIcon name={name} size={22} color={active ? '#3B6E4A' : '#999'} />
    <Text style={[styles.tabLabel, { color: active ? '#3B6E4A' : '#999' }]}>{label}</Text>
  </TouchableOpacity>
);

const MapScreen = () => {
  const [currentTab, setCurrentTab] = useState('Map');
  const [selectedBrgy, setSelectedBrgy] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarangayData();
  }, []);

  const fetchBarangayData = async () => {
    try {
      setLoading(true);
      // Ensure your endpoint matches your backend (plural 'barangays' is standard)
      const response = await fetch(`${API_URL}/barangay`);
      const data = await response.json();
      
      // Handle array or object response
      const actualData = Array.isArray(data) ? data : (data.data || []);
      setBarangays(actualData);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Now uses temperature_c
  const getMarkerColor = (tempStr) => {
    if (!tempStr) return '#6CAE75'; 
    const temp = parseFloat(String(tempStr).replace('°C', ''));
    if (temp >= 35) return '#D64545'; 
    if (temp >= 32) return '#E8A75D'; 
    return '#6CAE75'; 
  };

  const renderContent = () => {
    if (loading && currentTab === 'Map') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B6E4A" />
        </View>
      );
    }

    switch (currentTab) {
      case 'Dashboard': return <DashboardScreen />;
      case 'Reports': return <ReportsScreen />;
      case 'Establishment': return <EstablishmentScreen />;
      default:
        return (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={NAGA_CITY_CENTER}
          >
            {barangays.map((brgy, index) => {
              const lat = parseFloat(brgy.latitude);
              const lng = parseFloat(brgy.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker 
                  key={index}
                  coordinate={{ latitude: lat, longitude: lng }}
                  onPress={() => setSelectedBrgy(brgy)}
                  title={brgy.name} // Shows name on tap
                >
                  <View style={[
                    styles.customMarker, 
                    { borderColor: getMarkerColor(brgy.temperature_c) }
                  ]}>
                     <SafeIcon 
                        name="Thermometer" 
                        size={18} 
                        color={getMarkerColor(brgy.temperature_c)} 
                     />
                  </View>
                </Marker>
              );
            })}
          </MapView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={{ flex: 1 }}>{renderContent()}</View>

      {currentTab === 'Map' && selectedBrgy && (
        <View style={styles.cardOverlay}>
          <View style={styles.infoCard}>
            <Text style={styles.brgyName}>Brgy. {selectedBrgy.name}</Text>
            <Text style={styles.cityName}>{selectedBrgy.city}</Text>
            
            <View style={styles.statsRow}>
              {/* UPDATED: Displays temperature_c */}
              <View style={styles.statGroup}>
                <SafeIcon name="Thermometer" color="#E85D5D" size={24} />
                <Text style={styles.statValue}>{selectedBrgy.temperature_c}</Text>
              </View>

              {/* Displays density */}
              <View style={styles.statGroup}>
                <SafeIcon name="Users" color="#3B82F6" size={24} />
                <View>
                   <Text style={styles.statValue}>{selectedBrgy.density}</Text>
                   <Text style={styles.unitText}>Density</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => setSelectedBrgy(null)} style={styles.closeBtn}>
              <Text style={{color: '#3B6E4A', fontWeight: 'bold'}}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomTabBar}>
        <TabItem active={currentTab === 'Map'} label="Map" name="Map" onPress={() => setCurrentTab('Map')} />
        <TabItem active={currentTab === 'Dashboard'} label="Dash" name="LayoutDashboard" onPress={() => setCurrentTab('Dashboard')} />
        <TabItem active={currentTab === 'Reports'} label="Reports" name="ClipboardList" onPress={() => setCurrentTab('Reports')} />
        <TabItem active={currentTab === 'Establishment'} label="Establish" name="Building2" onPress={() => setCurrentTab('Establishment')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardOverlay: { position: 'absolute', bottom: 100, width: '100%', alignItems: 'center' },
  infoCard: { width: width * 0.9, backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  brgyName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  cityName: { fontSize: 13, color: '#999', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  statGroup: { alignItems: 'center', flexDirection: 'row' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  unitText: { fontSize: 10, color: '#999', marginLeft: 8 },
  bottomTabBar: { flexDirection: 'row', height: 80, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EEE', paddingBottom: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4 },
  customMarker: { backgroundColor: 'white', padding: 6, borderRadius: 20, borderWidth: 3, elevation: 5 },
  closeBtn: { marginTop: 15, alignSelf: 'center', padding: 10 }
});

export default MapScreen;