class HapticManager {
  private static instance: HapticManager;
  private enabled = true;

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  // Check if device supports haptic feedback
  isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled && this.isSupported();
  }

  // Light haptic feedback for hover interactions
  light() {
    if (!this.isEnabled()) return;
    navigator.vibrate(10);
  }

  // Medium haptic feedback for clicks and selections
  medium() {
    if (!this.isEnabled()) return;
    navigator.vibrate(25);
  }

  // Strong haptic feedback for important actions
  strong() {
    if (!this.isEnabled()) return;
    navigator.vibrate(50);
  }

  // Success pattern for positive outcomes
  success() {
    if (!this.isEnabled()) return;
    navigator.vibrate([50, 50, 100]);
  }

  // Error pattern for negative outcomes
  error() {
    if (!this.isEnabled()) return;
    navigator.vibrate([100, 50, 100, 50, 100]);
  }

  // Item interaction patterns
  itemSelect() {
    if (!this.isEnabled()) return;
    navigator.vibrate(15);
  }

  itemEquip() {
    if (!this.isEnabled()) return;
    navigator.vibrate([25, 25, 50]);
  }

  itemDrag() {
    if (!this.isEnabled()) return;
    navigator.vibrate(8);
  }

  // Rarity-based feedback
  rarityFeedback(rarity: string) {
    if (!this.isEnabled()) return;
    
    switch (rarity.toLowerCase()) {
      case 'common':
        navigator.vibrate(20);
        break;
      case 'rare':
        navigator.vibrate([30, 20, 30]);
        break;
      case 'epic':
        navigator.vibrate([40, 20, 40, 20, 40]);
        break;
      case 'legendary':
        navigator.vibrate([60, 30, 60, 30, 100]);
        break;
      case 'mythical':
        navigator.vibrate([100, 50, 100, 50, 150, 50, 100]);
        break;
      default:
        navigator.vibrate(20);
    }
  }

  // Box opening sequence
  boxOpeningSequence() {
    if (!this.isEnabled()) return;
    
    // Build anticipation with increasing intensity
    setTimeout(() => navigator.vibrate(20), 0);
    setTimeout(() => navigator.vibrate(30), 500);
    setTimeout(() => navigator.vibrate(40), 1000);
    setTimeout(() => navigator.vibrate(60), 1500);
  }

  // Achievement unlock pattern
  achievementUnlock() {
    if (!this.isEnabled()) return;
    navigator.vibrate([100, 50, 100, 50, 200]);
  }

  // Currency collection
  coinCollect() {
    if (!this.isEnabled()) return;
    navigator.vibrate([10, 10, 15]);
  }

  // Card flip for reveals
  cardFlip() {
    if (!this.isEnabled()) return;
    navigator.vibrate(30);
  }

  // Custom pattern for special events
  customPattern(pattern: number[]) {
    if (!this.isEnabled()) return;
    navigator.vibrate(pattern);
  }

  // Specific rarity methods for box opening
  mythical() {
    this.rarityFeedback('mythical');
  }

  legendary() {
    this.rarityFeedback('legendary');
  }

  epic() {
    this.rarityFeedback('epic');
  }

  rare() {
    this.rarityFeedback('rare');
  }

  common() {
    this.rarityFeedback('common');
  }
}

export const hapticManager = HapticManager.getInstance();