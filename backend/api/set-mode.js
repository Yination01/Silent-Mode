const { db, auth } = require('../utils/firebaseAdmin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!db || !auth) return res.status(500).json({ error: 'Service unavailable' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const decodedToken = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);

    const { userId, modeType, active } = req.body;
    if (!userId || !modeType) return res.status(400).json({ error: 'Missing required fields' });
    if (userId !== decodedToken.uid) return res.status(403).json({ error: 'Forbidden' });

    const modesSnapshot = await db.collection('users').doc(userId).collection('modes').get();
    const batch = db.batch();
    modesSnapshot.docs.forEach(doc => batch.update(doc.ref, { active: false }));
    if (active) batch.update(db.collection('users').doc(userId).collection('modes').doc(modeType), { active: true, updatedAt: new Date() });
    await batch.commit();

    res.json({ success: true, activeMode: active ? modeType : null });
  } catch (error) {
    console.error('Set mode error:', error);
    res.status(500).json({ error: 'Failed to update mode' });
  }
};