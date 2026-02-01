import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, FlatList, 
  TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl,
  Modal, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function EstablishmentsScreen() {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // New State for Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API_URL = 'https://bytetech.onrender.com/api/establishments';

  const fetchEstablishments = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEstablishments(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEstablishments();
  };

  // Function to handle card press
  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderEstablishment = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons 
          name={getIcon(item.establishment_type)} 
          size={26} 
          color="#5B9A8B" 
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.establishmentName}>{item.establishment_name}</Text>
        <Text style={styles.densityValue}>{item.density} Density • {item.temperature_c}°C</Text>
      </View>

      <View style={styles.trendBadge}>
        <Ionicons name="triangle" size={10} color="#88B04B" style={styles.trendIcon} />
        <Text style={styles.trendText}>6%</Text>
        <Feather name="arrow-up" size={16} color="#88B04B" />
      </View>
    </TouchableOpacity>
  );

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hardware': return 'tools';
      case 'mall': return 'shopping';
      default: return 'store-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity><Ionicons name="chevron-back" size={24} color="#4A665E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Establishments</Text>
        <TouchableOpacity style={styles.downloadCircle}>
          <Feather name="download" size={18} color="#4A665E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A665E" />
        </View>
      ) : (
        <FlatList
          data={establishments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEstablishment}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={() => (
            <View>
              <Text style={styles.subHeaderText}>Top 20% Emission Contributors</Text>
              <View style={styles.filterRow}>
                <View style={styles.dateSelector}>
                  <MaterialCommunityIcons name="leaf" size={16} color="#4CAF50" />
                  <Text style={styles.filterText}> April 2024</Text>
                </View>
                <View style={styles.unitSelector}>
                  <Text style={styles.filterText}>By CO₂e-</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* --- ESTABLISHMENT DETAIL MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Establishment Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#4A665E" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <DetailRow label="Name" value={selectedItem.establishment_name} icon="business" />
                <DetailRow label="Type" value={selectedItem.establishment_type} icon="layers" />
                <DetailRow label="Latitude" value={selectedItem.latitude} icon="map" />
                <DetailRow label="Longitude" value={selectedItem.longitude} icon="map" />
                <DetailRow label="Density" value={`${selectedItem.density} Density`} icon="leaf" />
                <DetailRow label="Temperature" value={`${selectedItem.temperature_c}°C`} icon="thermometer" />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper component for Modal Rows
const DetailRow = ({ label, value, icon }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color="#5B9A8B" style={styles.rowIcon} />
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  downloadCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 20 },
  subHeaderText: { fontSize: 15, color: '#666', marginBottom: 15 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dateSelector: { flexDirection: 'row', backgroundColor: '#FFF', padding: 10, borderRadius: 12, alignItems: 'center', flex: 2, elevation: 1 },
  unitSelector: { backgroundColor: '#FFF', padding: 10, borderRadius: 12, alignItems: 'center', flex: 1, elevation: 1 },
  filterText: { color: '#555', fontWeight: '500' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F7F6', justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, marginLeft: 15 },
  establishmentName: { fontSize: 17, fontWeight: '600', color: '#333' },
  densityValue: { fontSize: 14, color: '#666' },
  trendBadge: { flexDirection: 'row', alignItems: 'center' },
  trendText: { color: '#88B04B', fontWeight: 'bold', fontSize: 16, marginRight: 2 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowIcon: { marginRight: 15 },
  detailLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  detailValue: { fontSize: 16, color: '#333', fontWeight: '500' }
});