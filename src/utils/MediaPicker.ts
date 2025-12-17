// native/MediaPicker.ts
import { NativeModules, Platform } from 'react-native';

type Mode = 'any' | 'image' | 'video' | 'google_photos';

type PickOptions = { mode: Mode };

type PickResult = {
  uri: string;
  mime: string;
  fileName?: string;
  width?: number;
  height?: number;
  durationMs?: number;
};

const { RNTMediaPicker } = NativeModules;

export default {
  pickMedia(opts: PickOptions): Promise<PickResult> {
    if (!RNTMediaPicker) throw new Error('RNTMediaPicker not linked');
    return RNTMediaPicker.pickMedia(opts);
  },
};
