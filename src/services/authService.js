export async function signUpWithEmail(email, password, referralCode = null) {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    try {
      await createUserProfile(user.uid, email, referralCode);
      Logger.info('User signed up', { userId: user.uid });
      return user;
    } catch (profileError) {
      await auth().signOut();
      Logger.error('Profile creation failed, user signed out', profileError);
      throw new Error('Failed to create user profile. Please try again.');
    }
  } catch (error) {
    Logger.error('Sign up failed', error, { email });
    throw error;
  }
}