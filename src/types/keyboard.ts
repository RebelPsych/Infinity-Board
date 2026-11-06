export type KeyboardMode = 'alpha' | 'symbols';

export type ShiftState = 'off' | 'shift' | 'caps';

export interface KeyConfig {
  id: string;
  label: string;
  value?: string;
  secondaryLabel?: string;
  width?: string;
  isSpecial?: boolean;
  type?: 'char' | 'action' | 'space' | 'tab' | 'shift' | 'backspace' | 'enter';
  ariaLabel?: string;
}

export interface KeyboardSettings {
  theme: 'pure-black' | 'charcoal' | 'high-contrast-neon' | 'matrix-green';
  soundEnabled: boolean;
  soundVolume: number;
  soundType: 'mechanical' | 'soft-click' | 'typewriter' | 'bubble';
  hapticsEnabled: boolean;
  keyHeightRatio: 'compact' | 'standard' | 'tall';
  showKeyPopup: boolean;
  autoCapitalize: boolean;
  showPhoneFrame: boolean;
  swipeSensitivity: number;
}
