import { Howl, Howler } from 'howler';

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private volume = 0.7;
  private enabled = true;

  constructor() {
    // Initialize sound effects
    this.loadSounds();
    
    // Set master volume
    Howler.volume(this.volume);
  }

  private loadSounds() {
    // Case opening sounds
    this.sounds.set('case_open_start', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69']
    }));

    this.sounds.set('case_open_reveal', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69']
    }));

    this.sounds.set('ui_click', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.3
    }));

    this.sounds.set('ui_hover', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.2
    }));

    // Rarity-specific sounds
    this.sounds.set('common_drop', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.4
    }));

    this.sounds.set('legendary_drop', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.8
    }));

    // Item interaction sounds
    this.sounds.set('item_select', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.4
    }));

    this.sounds.set('item_equip', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.5
    }));

    this.sounds.set('item_drag', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.3
    }));

    this.sounds.set('achievement_unlock', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.7
    }));

    this.sounds.set('coin_collect', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.6
    }));

    // Spinning wheel sounds
    this.sounds.set('wheel_spin', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.5,
      loop: true
    }));

    this.sounds.set('wheel_tick', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.3
    }));

    this.sounds.set('wheel_stop', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.7
    }));

    this.sounds.set('confetti_burst', new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjCH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+ORSA0PUarm7K5ZFgU7k9n0yYU2Bhxqvu7mnEoODlOq5O2zYBoGPJTY88eAMgQeab3tx5pIDAFVq+ftrVoXBT2W2PLEfSsFHW3A7ePmlEgNA1Wy6O67YhoGOpPZ9MeEOAUUXrTp5Z1QDwxMo97wwW4fBjiX3PKlcysFKoHL8tiKOQgXY7zs55hKDAJSqOPws2IcBz2S2fTHgjMGKW69'],
      volume: 0.8
    }));
  }

  play(soundKey: string, options: { volume?: number; interrupt?: boolean } = {}) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundKey);
    if (!sound) {
      console.warn(`Sound "${soundKey}" not found`);
      return;
    }

    if (options.interrupt && sound.playing()) {
      sound.stop();
    }

    if (options.volume !== undefined) {
      sound.volume(options.volume);
    }

    sound.play();
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.volume);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      Howler.stop();
    }
  }

  getVolume() {
    return this.volume;
  }

  isEnabled() {
    return this.enabled;
  }

  // Play contextual sounds based on rarity
  playDropSound(rarity: string) {
    switch (rarity.toLowerCase()) {
      case 'mythical':
      case 'legendary':
        this.play('legendary_drop', { volume: 0.8 });
        break;
      case 'epic':
      case 'rare':
        this.play('case_open_reveal', { volume: 0.6 });
        break;
      default:
        this.play('common_drop', { volume: 0.4 });
    }
  }

  // UI interaction sounds
  playUISound(action: 'click' | 'hover' | 'success' | 'error') {
    switch (action) {
      case 'click':
        this.play('ui_click');
        break;
      case 'hover':
        this.play('ui_hover');
        break;
      case 'success':
        this.play('case_open_reveal', { volume: 0.5 });
        break;
      case 'error':
        // Play a different sound for errors
        this.play('ui_click', { volume: 0.2 });
        break;
    }
  }

  // Spinning wheel specific sounds
  playSpinSound() {
    this.play('wheel_spin', { interrupt: true });
  }

  stopSpinSound() {
    const spinSound = this.sounds.get('wheel_spin');
    if (spinSound) {
      spinSound.stop();
    }
  }

  playWinSound(rarity: string) {
    this.stopSpinSound();
    this.play('wheel_stop');
    
    setTimeout(() => {
      this.playDropSound(rarity);
      if (rarity === 'legendary' || rarity === 'mythical') {
        setTimeout(() => {
          this.play('confetti_burst');
        }, 500);
      }
    }, 300);
  }

  playTickSound() {
    this.play('wheel_tick', { volume: 0.2 });
  }

  preloadSounds() {
    // Preload all sounds for better performance
    this.sounds.forEach(sound => {
      sound.load();
    });
  }
}

export const soundManager = new SoundManager();