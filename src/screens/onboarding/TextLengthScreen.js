import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TEXT_LENGTHS, SURVEY_QUESTIONS } from '../../config/constants';
import { updateTextLength, updateSurveyAnswers } from '../../services/userService';
import { selectionHaptic, successHaptic } from '../../utils/haptics';
import Logger from '../../utils/logger';
import auth from '@react-native-firebase/auth';

export default function TextLengthScreen({ navigation }) {
  const theme = useTheme();
  const [selected, setSelected] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transitionToSurvey = useCallback(() => {
    Animated.sequence([Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }), Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })]).start();
    setShowSurvey(true);
  }, [fadeAnim]);

  const saveTextLength = useCallback(async (length, surveyAnswers = null) => {
    const userId = auth().currentUser?.uid;
    if (!userId) { Alert.alert('Error', 'Please sign in again.'); return; }
    successHaptic();
    setLoading(true);
    try {
      await updateTextLength(userId, length);
      if (surveyAnswers) {
        const surveyData = { answers: SURVEY_QUESTIONS.map((q, i) => ({ question: q.q, answer: q.a[surveyAnswers[i]] })), determinedLength: length };
        await updateSurveyAnswers(userId, surveyData);
      }
      Logger.info('Text length saved', { length });
      navigation.navigate('Permissions');
    } catch (error) {
      Logger.error('Failed to save text length', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  }, [navigation]);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    if (selected === 'not_sure') { selectionHaptic(); transitionToSurvey(); return; }
    saveTextLength(selected);
  }, [selected, saveTextLength, transitionToSurvey]);

  const handleSurveyAnswer = useCallback((answerIndex) => {
    selectionHaptic();
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    if (surveyStep < SURVEY_QUESTIONS.length - 1) {
      setSurveyStep(surveyStep + 1);
    } else {
      const sum = newAnswers.reduce((a, b) => a + b, 0);
      const avg = sum / newAnswers.length;
      let length;
      if (avg <= 0.7) length = 'short';
      else if (avg <= 1.7) length = 'medium';
      else length = 'long';
      saveTextLength(length, newAnswers).catch(error => { Logger.error('Survey save failed', error); Alert.alert('Error', 'Failed to save.'); });
    }
  }, [surveyStep, answers, saveTextLength]);

  if (showSurvey) {
    const question = SURVEY_QUESTIONS[surveyStep];
    return (
      <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
        <View style={styles.progress}>
          {[0, 1, 2, 3].map(i => <View key={i} style={[styles.progressDot, { backgroundColor: i <= 2 ? theme.colors.accent : theme.colors.border }]} />)}
        </View>
        <Text style={[styles.surveyProgress, { color: theme.colors.textSecondary }]}>Question {surveyStep + 1} of {SURVEY_QUESTIONS.length}</Text>
        <Text style={[styles.question, { color: theme.colors.text }]}>{question.q}</Text>
        {question.a.map((answer, index) => (
          <TouchableOpacity key={index} style={[styles.surveyOption, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={() => handleSurveyAnswer(index)} activeOpacity={0.7}>
            <Text style={[styles.surveyOptionText, { color: theme.colors.text }]}>"{answer}"</Text>
            <View style={[styles.radioButton, { borderColor: theme.colors.accent }]}>{answers[surveyStep] === index && <View style={[styles.radioSelected, { backgroundColor: theme.colors.accent }]} />}</View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.progress}>
        {[0, 1, 2, 3].map(i => <View key={i} style={[styles.progressDot, { backgroundColor: i <= 2 ? theme.colors.accent : theme.colors.border }]} />)}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>How long do you usually text?</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>We'll match your reply length automatically. Not sure? Take our quick survey.</Text>
      {TEXT_LENGTHS.map((item) => {
        const isSelected = selected === item.id;
        return (
          <TouchableOpacity key={item.id} style={[styles.lengthCard, { backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface, borderColor: isSelected ? theme.colors.accent : theme.colors.border, borderWidth: isSelected ? 3 : 2 }]} onPress={() => { selectionHaptic(); setSelected(item.id); }} activeOpacity={0.8}>
            <Text style={styles.lengthEmoji}>{item.emoji}</Text>
            <View style={styles.lengthInfo}>
              <Text style={[styles.lengthLabel, { color: isSelected ? theme.colors.black : theme.colors.text }]}>{item.label}</Text>
              <Text style={[styles.lengthExample, { color: isSelected ? theme.colors.black + 'CC' : theme.colors.textSecondary }]}>{item.example}</Text>
            </View>
            {isSelected && <View style={[styles.checkmark, { backgroundColor: theme.colors.black }]}><Text style={styles.checkmarkText}>✓</Text></View>}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={[styles.continueButton, { backgroundColor: selected ? theme.colors.accent : theme.colors.surface, opacity: selected && !loading ? 1 : 0.5 }]} onPress={handleContinue} disabled={!selected || loading} activeOpacity={0.8}>
        <Text style={[styles.continueText, { color: selected ? theme.colors.black : theme.colors.textSecondary }]}>{loading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 40 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 32, lineHeight: 24 },
  lengthCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 12 },
  lengthEmoji: { fontSize: 32, marginRight: 16 },
  lengthInfo: { flex: 1 },
  lengthLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  lengthExample: { fontSize: 14 },
  checkmark: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  continueButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 32, elevation: 6 },
  continueText: { fontSize: 18, fontWeight: '700' },
  surveyProgress: { fontSize: 14, marginBottom: 8 },
  question: { fontSize: 24, fontWeight: '600', marginBottom: 32, lineHeight: 32 },
  surveyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  surveyOptionText: { fontSize: 16, fontStyle: 'italic', lineHeight: 24, flex: 1, marginRight: 16 },
  radioButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { width: 12, height: 12, borderRadius: 6 },
});