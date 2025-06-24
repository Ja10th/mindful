import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Calendar,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface JournalEntry {
  id: string;
  date: string;
  sentences: string[];
  mood: string;
  emotions: string[];
}

const moodColors = {
  happy: '#10b981',
  neutral: '#f59e0b',
  sad: '#ef4444',
};

const moodIcons = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
};

export default function MoodTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const journalKeys = keys.filter(k => k.startsWith('journal_'));
        const raw = await AsyncStorage.multiGet(journalKeys);
        const parsed = raw
          .map(([_, v]) => v ? JSON.parse(v) : null)
          .filter(e => e && isInSelectedMonth(e.date))
          .sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        setEntries(parsed);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedMonth]);

  const isInSelectedMonth = (date: string) => {
    const d = new Date(date);
    return (
      d.getMonth() === selectedMonth.getMonth() &&
      d.getFullYear() === selectedMonth.getFullYear()
    );
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (dir === 'next' ? 1 : -1));
      return d;
    });
  };

  const getMoodStats = () => {
    const counts = { happy: 0, neutral: 0, sad: 0 };
    entries.forEach(e => counts[e.mood as keyof typeof counts]++);
    const total = entries.length;
    return (Object.entries(counts) as [keyof typeof counts, number][])
      .map(([mood, cnt]) => ({
        mood,
        count: cnt,
        percentage: total > 0 ? Math.round((cnt / total) * 100) : 0
      }));
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 font-mono">Loading your mood history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header & Navigation */}
        <Animated.View entering={FadeInDown.delay(200)} className="mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              className="p-2 rounded-full bg-gray-900 border border-gray-700"
            >
              <ChevronLeft color="#9ca3af" size={24} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Calendar color="#9ca3af" size={24} />
              <Text className="ml-3 text-2xl font-bold font-mono text-gray-100">
                {monthName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              className="p-2 rounded-full bg-gray-900 border border-gray-700"
            >
              <ChevronRight color="#9ca3af" size={24} />
            </TouchableOpacity>
          </View>

          {/* Mood Overview */}
          {entries.length > 0 && (
            <View className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
              <View className="flex-row items-center mb-4">
                <TrendingUp color="#a78bfa" size={24} />
                <Text className="ml-3 text-lg font-semibold font-mono text-gray-100">
                  Mood Overview
                </Text>
              </View>
              <View className="space-y-3">
                {getMoodStats().map(({ mood, count, percentage }) => {
                  const Icon = moodIcons[mood];
                  const color = moodColors[mood];
                  return (
                    <View
                      key={mood}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <Icon color={color} size={20} />
                        <Text className="ml-3 text-gray-300 font-mono capitalize">
                          {mood}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View
                          className="h-2 rounded-full mr-3 bg-gray-700"
                          style={{ width: 60 }}
                        >
                          <View
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </View>
                        <Text className="text-gray-300 w-12 text-right">
                          {count} days
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Entries List */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="text-lg font-semibold font-mono text-gray-100 mb-4">
            Journal Entries ({entries.length})
          </Text>

          {entries.length === 0 ? (
            <View className="bg-gray-800 p-8 rounded-xl border border-gray-700 items-center">
              <Calendar color="#4b5563" size={48} />
              <Text className="text-gray-400 font-mono text-center mt-4">
                No entries for this month yet.{'\n'}
                Start journaling to see your mood patterns!
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {entries.map((entry, i) => {
                const Icon = moodIcons[entry.mood as keyof typeof moodIcons];
                const color = moodColors[entry.mood as keyof typeof moodColors];
                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.delay(400 + i * 100)}
                    className="bg-gray-800 p-4 rounded-xl border border-gray-700"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-base font-medium font-mono text-gray-100">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                      <View className="flex-row items-center">
                        <Icon color={color} size={20} fill={color} />
                        <Text className="ml-2 text-gray-300 font-mono capitalize">
                          {entry.mood}
                        </Text>
                      </View>
                    </View>
                    <View className="mb-3">
                      {entry.sentences.map((s, idx) => (
                        <Text
                          key={idx}
                          className="text-gray-300 font-mono mb-1"
                        >
                          • {s}
                        </Text>
                      ))}
                    </View>
                    {entry.emotions.length > 0 && (
                      <View className="flex-row flex-wrap">
                        {entry.emotions.map((emo, idx) => (
                          <View
                            key={idx}
                            className="bg-gray-700 px-3 py-1 rounded-full mr-2 mb-1"
                          >
                            <Text className="text-xs font-mono text-gray-300 capitalize">
                              {emo}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
