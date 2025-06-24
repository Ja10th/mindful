import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Settings,
  Shield,
  Trash2,
  Download,
  Info,
  Heart,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsTab() {
  const [isClearing, setIsClearing] = useState(false);

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your journal entries and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              const keys = await AsyncStorage.getAllKeys();
              const journalKeys = keys.filter((k) =>
                k.startsWith('journal_')
              );
              await AsyncStorage.multiRemove(journalKeys);
              Alert.alert('Success', 'All journal data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const journalKeys = keys.filter((k) => k.startsWith('journal_'));
      const entriesData = await AsyncStorage.multiGet(journalKeys);
      const entries = entriesData
        .map(([_, v]) => (v ? JSON.parse(v) : null))
        .filter((e) => e)
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      if (entries.length === 0) {
        Alert.alert('No Data', 'No journal entries found to export.');
        return;
      }

      Alert.alert(
        'Export Data',
        `Found ${entries.length} journal entries. In a full version, this would export your data to a file or email.`
      );
    } catch {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About Mindful',
      "Mindful is your pocket companion for daily reflection and mental wellness.\n\nVersion 1.0.0\n\nMade with 💜 for your wellbeing."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator>
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="mb-8 flex-row items-center"
        >
          <Settings color="#9ca3af" size={24} />
          <Text className="ml-3 text-2xl font-bold font-mono text-gray-100">
            Settings
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} className="space-y-4">
          {/* Privacy Section */}
          <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <View className="p-4 border-b border-gray-700 flex-row items-center">
              <Shield color="#10b981" size={20} />
              <Text className="ml-3 text-base font-mono text-gray-100">
                Privacy
              </Text>
            </View>
            <View className="p-4">
              <Text className="text-gray-300 text-sm font-mono leading-6">
                Your journal entries are stored locally on your device and
                never sent to any servers. Your thoughts remain completely
                private and secure.
              </Text>
            </View>
          </View>

          {/* Data Management Section */}
          <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <View className="p-4 border-b border-gray-700">
              <Text className="text-base font-mono text-gray-100">
                Data Management
              </Text>
            </View>

            <TouchableOpacity
              onPress={exportData}
              className="p-4 border-b border-gray-700 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Download color="#0ea5e9" size={20} />
                <Text className="ml-3 text-sm font-mono text-gray-100">
                  Export Data
                </Text>
              </View>
              <Text className="text-gray-500">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearAllData}
              disabled={isClearing}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Trash2 color="#ef4444" size={20} />
                <Text className="ml-3 text-sm font-mono text-gray-100">
                  {isClearing ? 'Clearing...' : 'Clear All Data'}
                </Text>
              </View>
              <Text className="text-gray-500">›</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <TouchableOpacity
              onPress={showAbout}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Info color="#9d87ff" size={20} />
                <Text className="ml-3 text-base font-mono text-gray-100">
                  About Mindful
                </Text>
              </View>
              <Text className="text-gray-500">›</Text>
            </TouchableOpacity>
          </View>

          {/* Wellness Tips */}
          <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <View className="p-4 border-b border-gray-700 flex-row items-center">
              <Heart color="#ec4899" size={20} />
              <Text className="ml-3 text-base font-mono text-gray-100">
                Wellness Tips
              </Text>
            </View>
            <View className="p-4 space-y-3 ">
              <Text className="text-xs text-gray-300 font-mono">
                Journal at the same time each day to build a habit
              </Text>
              <Text className="text-xs text-gray-300 font-mono">
                Be honest about your feelings—there’s no judgment here
              </Text>
              <Text className="text-xs text-gray-300 font-mono">
                Focus on small moments of gratitude
              </Text>
              <Text className="text-xs text-gray-300 font-mono">
                Remember that all emotions are valid
              </Text>
              <Text className="text-xs text-gray-300 font-mono">
                Take time to reflect on your growth
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center py-8">
            <Text className="text-gray-500 font-mono text-sm text-center">
              Made with love for your mental wellness journey
            </Text>
            <Text className="text-gray-600 text-xs font-mono mt-2">v1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
