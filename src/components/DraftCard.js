import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { successHaptic, errorHaptic, impactHaptic } from '../utils/haptics';
import { Swipeable } from 'react-native-gesture-handler';

function DraftCard({ draft, onApprove, onSkip, onEdit }) {
  const theme = useTheme();

  const statusColors = { sent: theme.colors.success, skipped: theme.colors.warning, edited: theme.colors.accent };

  const handleApprove = useCallback(() => { successHaptic(); onApprove?.(); }, [onApprove]);
  const handleSkip = useCallback(() => { errorHaptic(); onSkip?.(); }, [onSkip]);
  const handleEdit = useCallback(() => { impactHaptic(); onEdit?.(); }, [onEdit]);

  const renderRightActions = useCallback((progressAnimatedValue) => {
    const trans = progressAnimatedValue.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
    return (
      <View style={styles.swipeActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity style={[styles.swipeButton, { backgroundColor: theme.colors.error }]} onPress={handleSkip}>
            <Text style={styles.swipeButtonText}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity style={[styles.swipeButton, { backgroundColor: theme.colors.accent }]} onPress={handleApprove}>
            <Text style={[styles.swipeButtonText, { color: theme.colors.black }]}>Approve</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [theme, handleApprove, handleSkip]);

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.header}>
          <View style={styles.senderInfo}>
            <Text style={[styles.sender, { color: theme.colors.text }]}>{draft.sender}</Text>
            <Text style={[styles.platform, { color: theme.colors.textSecondary }]}>{draft.platform}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[draft.status] || theme.colors.textSecondary) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[draft.status] || theme.colors.textSecondary }]}>{draft.status || 'pending'}</Text>
          </View>
        </View>
        <View style={[styles.messageSection, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Incoming:</Text>
          <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={3}>{draft.incomingText}</Text>
        </View>
        <View style={[styles.messageSection, { backgroundColor: theme.colors.surfaceLight }]}>
          <Text style={[styles.label, { color: theme.colors.accent }]}>Draft Reply:</Text>
          <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={4}>{draft.draftReply}</Text>
        </View>
        {draft.status !== 'sent' && draft.status !== 'skipped' && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, { borderColor: theme.colors.error, borderWidth: 1 }]} onPress={handleSkip}>
              <Text style={[styles.actionText, { color: theme.colors.error }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { borderColor: theme.colors.accent, borderWidth: 1 }]} onPress={handleEdit}>
              <Text style={[styles.actionText, { color: theme.colors.accent }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.accent }]} onPress={handleApprove}>
              <Text style={[styles.actionText, { color: theme.colors.black }]}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  senderInfo: { flex: 1 },
  sender: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  platform: { fontSize: 12, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  messageSection: { padding: 12, borderRadius: 8, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  message: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600' },
  swipeActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  swipeButton: { width: 80, height: '100%', justifyContent: 'center', alignItems: 'center', marginLeft: 4, borderRadius: 12 },
  swipeButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

export default React.memo(DraftCard);