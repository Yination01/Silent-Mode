// Add these tabs to the existing AdminDashboardScreen:
const [activeTab, setActiveTab] = useState('monetization');
// Change to include new tabs:
{['monetization', 'features', 'limits', 'vip', 'promos', 'referrals', 'admin'].map(tab => (...))}

// Add VIP tab content:
{activeTab === 'vip' && (
  <View>
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>👑 Default User Tier</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>What tier should new users get?</Text>
      <View style={styles.modeGrid}>
        {[
          { id: 'free', label: 'Free', emoji: '🆓' },
          { id: 'vip', label: 'VIP', emoji: '👑' },
          { id: 'premium', label: 'Premium', emoji: '💎' },
        ].map(tier => (
          <TouchableOpacity key={tier.id} style={[styles.modeCard, { backgroundColor: vipConfig.defaultTier === tier.id ? theme.colors.accent : theme.colors.surfaceLight, borderColor: vipConfig.defaultTier === tier.id ? theme.colors.accent : theme.colors.border }]} onPress={() => updateVipConfig('defaultTier', tier.id)}>
            <Text style={styles.modeEmoji}>{tier.emoji}</Text>
            <Text style={[styles.modeLabel, { color: vipConfig.defaultTier === tier.id ? theme.colors.black : theme.colors.text }]}>{tier.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>⏱️ Duration Settings</Text>
      <LimitRow label="Default VIP Duration (Days)" value={vipConfig.defaultVipDurationDays} onChange={(v) => updateVipConfig('defaultVipDurationDays', v)} theme={theme} />
      <LimitRow label="Default Premium Duration (Days)" value={vipConfig.defaultPremiumDurationDays} onChange={(v) => updateVipConfig('defaultPremiumDurationDays', v)} theme={theme} />
      <SwitchRow label="Enable Free Trial" value={vipConfig.trialEnabled} onValueChange={(v) => updateVipConfig('trialEnabled', v)} theme={theme} />
      {vipConfig.trialEnabled && <LimitRow label="Trial Duration (Days)" value={vipConfig.trialDurationDays} onChange={(v) => updateVipConfig('trialDurationDays', v)} theme={theme} />}
      <SwitchRow label="Auto-Activate VIP on Signup" value={vipConfig.autoActivateVip} onValueChange={(v) => updateVipConfig('autoActivateVip', v)} theme={theme} />
    </View>
  </View>
)}

// Add Promos tab content:
{activeTab === 'promos' && (
  <View>
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>🎫 Promo Codes</Text>
      {promoCodes.map(promo => (
        <View key={promo.id} style={styles.promoRow}>
          <View style={styles.promoInfo}>
            <Text style={[styles.promoCode, { color: theme.colors.accent }]}>{promo.code}</Text>
            <Text style={[styles.promoDetail, { color: theme.colors.textSecondary }]}>
              {promo.type} • {promo.currentUses}/{promo.maxUses} used • {promo.isActive ? 'Active' : 'Inactive'}
            </Text>
            {promo.expiresAt && <Text style={[styles.promoDetail, { color: theme.colors.warning }]}>Expires: {new Date(promo.expiresAt.toDate?.() || promo.expiresAt).toLocaleDateString()}</Text>}
          </View>
          <View style={styles.promoActions}>
            <TouchableOpacity onPress={() => togglePromoActive(promo)}><Text style={[styles.promoAction, { color: promo.isActive ? theme.colors.error : theme.colors.accent }]}>{promo.isActive ? 'Deactivate' : 'Activate'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => deletePromoCode(promo.id)}><Text style={[styles.promoAction, { color: theme.colors.error }]}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      {promoCodes.length === 0 && <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No promo codes created yet.</Text>}
    </View>
    <TouchableOpacity style={[styles.addButton, { borderColor: theme.colors.accent }]} onPress={() => setShowPromoForm(true)}>
      <Text style={[styles.addText, { color: theme.colors.accent }]}>+ Create Promo Code</Text>
    </TouchableOpacity>
    {showPromoForm && <PromoCodeForm onSave={handleCreatePromo} onCancel={() => setShowPromoForm(false)} theme={theme} />}
  </View>
)}

// Add Referrals tab content:
{activeTab === 'referrals' && (
  <View>
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>🔗 Referral Program</Text>
      <SwitchRow label="Enable Referral Program" value={vipConfig.referralReward?.enabled} onValueChange={(v) => updateVipConfigReferral('enabled', v)} theme={theme} />
      <LimitRow label="Referrer Reward (Days)" value={vipConfig.referralReward?.referrerRewardDays || 7} onChange={(v) => updateVipConfigReferral('referrerRewardDays', v)} theme={theme} />
      <LimitRow label="Referred Reward (Days)" value={vipConfig.referralReward?.referredRewardDays || 7} onChange={(v) => updateVipConfigReferral('referredRewardDays', v)} theme={theme} />
      <LimitRow label="Max Rewards Per User" value={vipConfig.referralReward?.maxReferralRewards || 10} onChange={(v) => updateVipConfigReferral('maxReferralRewards', v)} theme={theme} />
    </View>
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>🏆 Top Referrers</Text>
      {leaderboard.map((entry, index) => (
        <View key={index} style={styles.leaderboardRow}>
          <Text style={[styles.leaderboardRank, { color: index < 3 ? theme.colors.accent : theme.colors.textSecondary }]}>#{index + 1}</Text>
          <Text style={[styles.leaderboardName, { color: theme.colors.text }]}>{entry.email}</Text>
          <Text style={[styles.leaderboardStat, { color: theme.colors.accent }]}>{entry.referrals} referrals</Text>
        </View>
      ))}
      {leaderboard.length === 0 && <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No referrals yet.</Text>}
    </View>
  </View>
)}