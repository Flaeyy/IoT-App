import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface HistoryEvent {
  id: string;
  type: 'armed' | 'disarmed' | 'alert';
  message: string;
  timestamp: string;
  date: string;
}

const historyData: HistoryEvent[] = [
  {
    id: '1',
    type: 'disarmed',
    message: 'System disarmed',
    timestamp: '10:30 AM',
    date: 'Today',
  },
  {
    id: '2',
    type: 'armed',
    message: 'System armed',
    timestamp: '9:15 AM',
    date: 'Today',
  },
  {
    id: '3',
    type: 'alert',
    message: 'Motion detected',
    timestamp: '11:45 PM',
    date: 'Yesterday',
  },
  {
    id: '4',
    type: 'disarmed',
    message: 'System disarmed',
    timestamp: '6:20 PM',
    date: 'Yesterday',
  },
  {
    id: '5',
    type: 'armed',
    message: 'System armed',
    timestamp: '8:00 AM',
    date: 'Yesterday',
  },
];

export default function HistoryScreen() {
  const getIconName = (type: string) => {
    switch (type) {
      case 'armed':
        return 'lock.shield.fill';
      case 'disarmed':
        return 'lock.open.fill';
      case 'alert':
        return 'exclamationmark.triangle.fill';
      default:
        return 'clock.fill';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'armed':
        return '#4CAF50';
      case 'disarmed':
        return '#2196F3';
      case 'alert':
        return '#FF5252';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.title}>Historial</Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {historyData.map((event, index) => (
          <View key={event.id}>
            {(index === 0 || event.date !== historyData[index - 1].date) && (
              <Text style={styles.dateHeader}>{event.date}</Text>
            )}
            
            <View style={styles.eventCard}>
              <View style={[styles.iconContainer, { backgroundColor: getIconColor(event.type) + '20' }]}>
                <IconSymbol 
                  name={getIconName(event.type)} 
                  size={24} 
                  color={getIconColor(event.type)} 
                />
              </View>
              
              <View style={styles.eventContent}>
                <Text style={styles.eventMessage}>{event.message}</Text>
                <Text style={styles.eventTime}>{event.timestamp}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B9BC4',
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 15,
    opacity: 0.9,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
});
