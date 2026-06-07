import { useAppStore } from '../store/appStore';
import Logger from '../utils/logger';

class ContactService {
  static getContactSetting(contactId) {
    const contactSettings = useAppStore.getState().contactSettings || {};
    return contactSettings[contactId] || null;
  }

  static setContactTone(contactId, tonePreset) {
    useAppStore.getState().setContactSetting(contactId, { tonePreset });
    Logger.info('Contact tone set', { contactId, tonePreset });
  }

  static setContactMode(contactId, modeId) {
    useAppStore.getState().setContactSetting(contactId, { modeId });
    Logger.info('Contact mode set', { contactId, modeId });
  }

  static isIncognito(contactId) {
    const incognitoContacts = useAppStore.getState().incognitoContacts || [];
    return incognitoContacts.includes(contactId);
  }

  static toggleIncognito(contactId) {
    const { incognitoContacts, addIncognitoContact, removeIncognitoContact } = useAppStore.getState();
    if (incognitoContacts.includes(contactId)) {
      removeIncognitoContact(contactId);
      return false;
    } else {
      addIncognitoContact(contactId);
      return true;
    }
  }

  static getContactFrequency() {
    return 'normal';
  }
}

export default ContactService;