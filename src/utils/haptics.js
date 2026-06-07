import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function triggerHaptic(type = 'impactLight') {
  ReactNativeHapticFeedback.trigger(type, options);
}

export function successHaptic() { triggerHaptic('notificationSuccess'); }
export function errorHaptic() { triggerHaptic('notificationError'); }
export function selectionHaptic() { triggerHaptic('impactLight'); }
export function impactHaptic() { triggerHaptic('impactMedium'); }