import { Linking, Alert } from 'react-native';
import Logger from '../utils/logger';

const BUY_ME_COFFEE_URL = 'https://www.buymeacoffee.com/silentmode';
const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/silentmodeapp';

export async function openBuyMeCoffee(amount = null) {
  try {
    const url = amount ? `${BUY_ME_COFFEE_URL}/checkout?amount=${amount}` : BUY_ME_COFFEE_URL;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      Logger.info('Opened Buy Me Coffee', { amount });
    } else {
      Alert.alert('Open in Browser', `Visit ${BUY_ME_COFFEE_URL} to support SilentMode`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Linking.openURL(url) },
      ]);
    }
  } catch (error) {
    Logger.error('Payment error', error);
    Alert.alert('Error', 'Could not open payment page. Please visit buymeacoffee.com/silentmode');
    throw error;
  }
}

export async function openGitHubSponsors() {
  try {
    const supported = await Linking.canOpenURL(GITHUB_SPONSORS_URL);
    if (supported) await Linking.openURL(GITHUB_SPONSORS_URL);
  } catch (error) { Logger.error('GitHub Sponsors error', error); }
}