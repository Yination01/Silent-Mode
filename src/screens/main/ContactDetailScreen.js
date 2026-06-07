// The TONE_PRESETS import already includes all 6 vibes
// Add intensity link:
<TouchableOpacity 
  style={[styles.intensityLink, { borderColor: theme.colors.accent }]}
  onPress={() => navigation.navigate('VibeIntensity', { vibeId: contactTone || 'professional' })}
>
  <Text style={[styles.intensityLinkText, { color: theme.colors.accent }]}>
    Adjust Intensity →
  </Text>
</TouchableOpacity>