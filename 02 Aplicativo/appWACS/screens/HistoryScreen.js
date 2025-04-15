import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Dados mockados para demonstração
const historyData = [
  {
    title: 'Hoje',
    data: [
      {
        id: '1',
        type: 'movement',
        command: 'Frente',
        speed: '50%',
        duration: '2 min',
        time: '10:30 AM',
        distance: '15 m',
      },
      {
        id: '2',
        type: 'stop',
        command: 'Parada de emergência',
        time: '10:32 AM',
        reason: 'Obstáculo detectado',
      },
    ],
  },
  {
    title: 'Ontem',
    data: [
      {
        id: '3',
        type: 'movement',
        command: 'Esquerda',
        speed: '40%',
        duration: '1 min',
        time: '09:15 AM',
        distance: '5 m',
      },
      {
        id: '4',
        type: 'movement',
        command: 'Ré',
        speed: '30%',
        duration: '3 min',
        time: '09:20 AM',
        distance: '10 m',
        obstacle: 'Obstáculo a 50 cm',
      },
    ],
  },
];

const statsData = {
  totalUsage: '5 horas',
  avgSpeed: '45%',
  totalDistance: '2.5 km',
  emergencyStops: 3,
  obstaclesDetected: 12,
};

const HistoryScreen = () => {
  const [activeTab, setActiveTab] = useState('history');

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemIcon}>
        <Icon 
          name={
            item.type === 'movement' ? 'arrow-right' : 
            item.type === 'stop' ? 'alert-octagon' : 'information'
          } 
          size={24} 
          color={
            item.type === 'movement' ? '#00f2fe' : 
            item.type === 'stop' ? '#ff4444' : '#ffcc00'
          } 
        />
      </View>
      <View style={styles.historyItemContent}>
        <Text style={styles.historyItemTitle}>{item.command}</Text>
        <Text style={styles.historyItemTime}>{item.time}</Text>
        
        {item.type === 'movement' && (
          <View style={styles.historyItemDetails}>
            <Text style={styles.historyItemDetail}>Velocidade: {item.speed}</Text>
            <Text style={styles.historyItemDetail}>Duração: {item.duration}</Text>
            <Text style={styles.historyItemDetail}>Distância: {item.distance}</Text>
          </View>
        )}
        
        {item.type === 'stop' && (
          <Text style={[styles.historyItemDetail, { color: '#ff4444' }]}>
            Motivo: {item.reason}
          </Text>
        )}
        
        {item.obstacle && (
          <Text style={[styles.historyItemDetail, { color: '#ff9900' }]}>
            {item.obstacle}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={styles.tabText}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={styles.tabText}>Estatísticas</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'history' ? (
        <SectionList
          sections={historyData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.historyList}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Uso Total</Text>
            <Text style={styles.statsValue}>{statsData.totalUsage}</Text>
            <Icon name="clock" size={30} color="#00f2fe" style={styles.statsIcon} />
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Velocidade Média</Text>
            <Text style={styles.statsValue}>{statsData.avgSpeed}</Text>
            <Icon name="speedometer" size={30} color="#00f2fe" style={styles.statsIcon} />
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Distância Total</Text>
            <Text style={styles.statsValue}>{statsData.totalDistance}</Text>
            <Icon name="map-marker-distance" size={30} color="#00f2fe" style={styles.statsIcon} />
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Paradas Emergenciais</Text>
            <Text style={styles.statsValue}>{statsData.emergencyStops}</Text>
            <Icon name="alert-octagon" size={30} color="#ff4444" style={styles.statsIcon} />
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Obstáculos Detectados</Text>
            <Text style={styles.statsValue}>{statsData.obstaclesDetected}</Text>
            <Icon name="alert" size={30} color="#ff9900" style={styles.statsIcon} />
          </View>
          
          <View style={styles.chartPlaceholder}>
            <Icon name="chart-line" size={50} color="#00f2fe" />
            <Text style={styles.chartText}>Gráfico de Uso Semanal</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    padding: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#141a24',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e2833',
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
  },
  historyList: {
    paddingBottom: 20,
  },
  sectionHeader: {
    color: '#00f2fe',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 10,
  },
  historyItem: {
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  historyItemIcon: {
    marginRight: 15,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  historyItemTime: {
    color: '#7a828a',
    fontSize: 12,
    marginBottom: 8,
  },
  historyItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  historyItemDetail: {
    color: '#7a828a',
    fontSize: 12,
    marginRight: 15,
    marginBottom: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#141a24',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e2833',
  },
  statsTitle: {
    color: '#7a828a',
    fontSize: 14,
    marginBottom: 5,
  },
  statsValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsIcon: {
    alignSelf: 'flex-end',
  },
  chartPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#141a24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2833',
    marginTop: 10,
  },
  chartText: {
    color: '#7a828a',
    marginTop: 10,
  },
});

export default HistoryScreen;