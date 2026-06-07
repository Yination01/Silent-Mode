// Add import:
import VibeIntensityScreen from '../screens/main/VibeIntensityScreen';

// Add to modal group:
<Stack.Screen 
  name="VibeIntensity" 
  component={VibeIntensityScreen} 
  options={({ route }) => ({ 
    title: `${route.params?.vibeId ? TONE_PRESETS.find(v => v.id === route.params.vibeId)?.label : 'Vibe'} Intensity`,
  })} 
/>