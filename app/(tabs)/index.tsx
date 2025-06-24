import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, Save, Smile, Meh, Frown, Heart, Zap, Coffee } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface JournalEntry {
  id: string;
  date: string;
  sentences: string[];
  mood: string;
  emotions: string[];
}

const moods = [
  { id: 'happy', icon: Smile, color: '#10b981', label: 'Happy' },
  { id: 'neutral', icon: Meh, color: '#f59e0b', label: 'Neutral' },
  { id: 'sad', icon: Frown, color: '#ef4444', label: 'Sad' },
];

const emotions = [
  { id: 'grateful', icon: Heart, color: '#ec4899', label: 'Grateful' },
  { id: 'energetic', icon: Zap, color: '#8b5cf6', label: 'Energetic' },
  { id: 'calm', icon: Coffee, color: '#06b6d4', label: 'Calm' },
];

export default function JournalTab() {
  const [sentences, setSentences] = useState(['', '', '']);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [todaysEntry, setTodaysEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(`journal_${today}`);
        if (stored) {
          const entry = JSON.parse(stored);
          setTodaysEntry(entry);
          setSentences(entry.sentences);
          setSelectedMood(entry.mood);
          setSelectedEmotions(entry.emotions);
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveEntry = async () => {
    const filled = sentences.filter(s => s.trim());
    if (!filled.length) {
      return Alert.alert('No content', 'Write at least one sentence.');
    }
    if (!selectedMood) {
      return Alert.alert('Missing mood', 'Select a mood first.');
    }
    const entry: JournalEntry = {
      id: today,
      date: today,
      sentences: filled,
      mood: selectedMood,
      emotions: selectedEmotions,
    };
    await AsyncStorage.setItem(`journal_${today}`, JSON.stringify(entry));
    setTodaysEntry(entry);
    Alert.alert('Saved!', 'Your entry is secure.');
  };

  const updateSentence = (i: number, t: string) => {
    const arr = [...sentences];
    arr[i] = t;
    setSentences(arr);
  };

  const toggleEmotion = (id: string) =>
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Loading your journal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black font-mono">
      <ScrollView
       showsVerticalScrollIndicator={false}   
      className="flex-1 px-6 py-4">
        <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
          <View className="flex-row items-center justify-center mb-2">
            <Calendar color="#9d87ff" size={24} />
            <Text className="ml-3 text-3xl font-bold font-mono tracking-widest text-white">
              Mindful
            </Text>
          </View>
          <Text className=" font-mono text-center text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} className="mb-8 mt-4">
          <Text className="text-base font-mono font-semibold text-gray-100 mb-4">
            Write up to 3 sentences about your day
          </Text>

          {sentences.map((text, idx) => (
            <View key={idx} className="mb-4">
              <Text className="text-sm font-mono text-gray-400 mb-2">
                Sentence {idx + 1}
              </Text>
              <TextInput
                value={text}
                onChangeText={t => updateSentence(idx, t)}
                placeholder={
                  idx === 0
                    ? 'What happened today?'
                    : idx === 1
                    ? 'What did you learn?'
                    : 'What are you grateful for?'
                }
                placeholderTextColor="#6b7280"
                className="bg-gray-800 p-4 font-mono leading-loose rounded-xl border border-gray-700 text-gray-400 min-h-[70px]"
                multiline
                textAlignVertical="top"
                maxLength={150}
              />
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {text.length}/150
              </Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} className="mb-8">
          <Text className="text-base font-semibold font-mono text-gray-100 mb-4">
            How are you feeling?
          </Text>
          <View className="flex-row justify-between mb-6">
            {moods.map(m => {
              const Icon = m.icon;
              const sel = selectedMood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setSelectedMood(m.id)}
                  className={`flex-1 mx-1 p-4 rounded-xl items-center ${
                    sel ? 'bg-gray-900 border-2' : 'bg-gray-900 border border-gray-700'
                  }`}
                  style={{ borderColor: sel ? m.color : undefined }}
                >
                  <Icon
                    color={m.color}
                    size={32}
                    fill={sel ? m.color : 'transparent'}
                  />
                  <Text className="mt-2 text-sm font-medium font-mono text-gray-300">
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-base font-medium font-mono text-gray-100 mb-3">
            Any specific emotions?
          </Text>
          <View className="flex-row flex-wrap">
            {emotions.map(e => {
              const Icon = e.icon;
              const sel = selectedEmotions.includes(e.id);
              return (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => toggleEmotion(e.id)}
                  className={`flex-row items-center px-4 py-2 mr-2 mb-2 rounded-full ${
                    sel
                      ? 'bg-gray-900 border-2'
                      : 'bg-gray-900 border border-gray-700'
                  }`}
                  style={{ borderColor: sel ? e.color : undefined }}
                >
                  <Icon
                    color={e.color}
                    size={16}
                    fill={sel ? e.color : 'transparent'}
                  />
                  <Text className="ml-2 text-sm font-mono text-gray-300">
                    {e.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} className="mb-8">
          <TouchableOpacity
            onPress={saveEntry}
            className="bg-[#9d87ff] p-4 rounded-xl flex-row items-center justify-center"
          >
            <Save color="white" size={24} />
            <Text className="ml-3 text-white font-semibold font-mono text-lg">
              {todaysEntry ? 'Update Entry' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {todaysEntry && (
          <Animated.View
            entering={FadeInDown.delay(600)}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700"
          >
            <Text className="text-base font-medium font-mono text-[#9d87ff] mb-2">
              ✓ Entry saved for today
            </Text>
            <Text className="text-xs font-mono text-gray-500">
              You can update your entry anytime before midnight.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
