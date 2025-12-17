import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

type ItemType = 'text' | 'emoji';

type Item = {
  id: string;
  type: ItemType;
  text: string;         // the text or emoji
  color: string;
  fontSize: number;
  x: number;            // top-left anchor
  y: number;
  scale: number;        // 1 = original
  rotation: number;     // degrees
};

type Props = {
  baseImageUri: string;             // background image to edit on
  initialDurationSec?: number;      // default 5
  onCancel?: () => void;
  onSave?: (payload: {
    baseImageUri: string;
    durationSec: number;
    items: Item[];
    canvas: { width: number; height: number };
  }) => void;
};

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_W = SCREEN_W;
const CANVAS_H = SCREEN_W * (16 / 9); // 16:9 canvas, tweak as you like

export default function StoryCreator({
  baseImageUri,
  initialDurationSec = 5,
  onCancel,
  onSave,
}: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [durationSec, setDurationSec] = useState(initialDurationSec);

  // palette & emoji samples
  const colors = ['#fff', '#000', '#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#b71540'];
  const emojis = ['😊', '🔥', '🎉', '✨', '❤️', '😎', '🌈'];

  // add text item
  const addText = () => {
    const id = String(Date.now());
    const newItem: Item = {
      id,
      type: 'text',
      text: 'Double-tap to edit',
      color: '#fff',
      fontSize: 28,
      x: 80,
      y: 20,
      scale: 1,
      rotation: 0,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(id);
  };

  // add emoji item
  const addEmoji = (emoji: string) => {
    const id = String(Date.now());
    const newItem: Item = {
      id,
      type: 'emoji',
      text: emoji,
      color: '#fff', // color ignored for emoji but we keep it for uniformity
      fontSize: 44,
      x: CANVAS_W / 2 - 20,
      y: CANVAS_H / 2 - 20,
      scale: 1,
      rotation: 0,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(id);
  };

  // update item helper
  const updateItem = (id: string, patch: Partial<Item>) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)));
  };

  // delete selected
  const deleteSelected = () => {
    if (!selectedId) return;
    setItems(prev => prev.filter(it => it.id !== selectedId));
    setSelectedId(null);
  };

  // text edit start (double-tap simulation)
  const beginEditText = (item: Item) => {
    setEditingText(item.text);
    setIsEditingText(true);
  };
  const commitEditText = () => {
    if (selectedId) updateItem(selectedId, { text: editingText });
    setIsEditingText(false);
  };

  // color change
  const setColor = (c: string) => {
    if (selectedId) updateItem(selectedId, { color: c });
  };

  // font size
  const bumpFont = (delta: number) => {
    if (!selectedId) return;
    const it = items.find(i => i.id === selectedId)!;
    const next = Math.max(10, Math.min(120, it.fontSize + delta));
    updateItem(selectedId, { fontSize: next });
  };

  // duration slider (custom, no libs)
  const sliderW = CANVAS_W - 32;
  const minSec = 1, maxSec = 15;
  const knobX = useMemo(() => {
    const t = (durationSec - minSec) / (maxSec - minSec);
    return t * sliderW;
  }, [durationSec, sliderW]);

  // PanResponder for slider knob
  const sliderRef = useRef({ startX: 0, startV: 0 });
  const sliderPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          sliderRef.current.startX = g.x0;
          sliderRef.current.startV = durationSec;
        },
        onPanResponderMove: (_evt, g) => {
          const dx = g.moveX - sliderRef.current.startX;
          const frac = dx / sliderW;
          const value = sliderRef.current.startV + frac * (maxSec - minSec);
          setDurationSec(Math.max(minSec, Math.min(maxSec, Math.round(value))));
        },
      }),
    [durationSec, sliderW]
  );

  const handleSave = () => {
    onSave?.({
      baseImageUri,
      durationSec,
      items,
      canvas: { width: CANVAS_W, height: CANVAS_H },
    });
  };

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.topBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Story</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.topBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrap}>
        <View style={styles.canvas}>
          <Image
            source={{ uri: baseImageUri }}
            style={{}}
            resizeMode="cover"
          />

          {/* items */}
          {items.map(it => (
            <MovableItem
              key={it.id}
              item={it}
              isSelected={it.id === selectedId}
              onSelect={() => setSelectedId(it.id)}
              onDoubleTap={() => it.type === 'text' && beginEditText(it)}
              onUpdate={patch => updateItem(it.id, patch)}
              bounds={{ width: CANVAS_W, height: CANVAS_H }}
            />
          ))}
        </View>
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.toolBtn} onPress={addText}>
            <Text style={styles.toolTxt}>Aa</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', columnGap: 8 }}>
            {emojis.slice(0, 5).map(e => (
              <TouchableOpacity key={e} onPress={() => addEmoji(e)} style={styles.emojiBtn}>
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.toolBtn, { opacity: selectedId ? 1 : 0.4 }]}
            onPress={() => bumpFont(2)}
            disabled={!selectedId}
          >
            <Text style={styles.toolTxt}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { opacity: selectedId ? 1 : 0.4 }]}
            onPress={() => bumpFont(-2)}
            disabled={!selectedId}
          >
            <Text style={styles.toolTxt}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: '#ff4d4f', opacity: selectedId ? 1 : 0.4 }]}
            onPress={deleteSelected}
            disabled={!selectedId}
          >
            <Text style={[styles.toolTxt, { color: '#fff' }]}>Del</Text>
          </TouchableOpacity>
        </View>

        {/* Color palette */}
        <View style={[styles.row, { marginTop: 10 }]}>
          {colors.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: c === '#fff' ? 1 : 0 }]}
            />
          ))}
        </View>

        {/* Duration slider */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Duration: {durationSec}s</Text>
          <View style={[styles.sliderTrack, { width: sliderW }]}>
            <View style={[styles.sliderFill, { width: knobX }]} />
            <View
              style={[styles.sliderKnob, { left: Math.max(0, Math.min(sliderW - 16, knobX - 8)) }]}
              {...sliderPan.panHandlers}
            />
          </View>
        </View>
      </View>

      {/* Text editor overlay */}
      {isEditingText && (
        <View style={styles.overlay}>
          <View style={styles.editorBox}>
            <TextInput
              autoFocus
              placeholder="Type something…"
              style={styles.input}
              value={editingText}
              onChangeText={setEditingText}
              multiline
            />
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setIsEditingText(false)}>
                <Text style={styles.topBtn}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={commitEditText}>
                <Text style={styles.topBtn}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * A single movable/resizable/rotatable text/emoji item using only PanResponder.
 * - 1 finger -> move
 * - 2 fingers -> pinch (scale) + rotate
 * - single tap -> select
 * - double tap -> edit text (parent handles)
 */
function MovableItem({
  item,
  isSelected,
  onSelect,
  onDoubleTap,
  onUpdate,
  bounds,
}: {
  item: Item;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleTap: () => void;
  onUpdate: (patch: Partial<Item>) => void;
  bounds: { width: number; height: number };
}) {
  const tapRef = useRef({ lastTap: 0 });

  const gesture = useRef({
    startX: 0,
    startY: 0,
    startScale: 1,
    startRotation: 0,
    startItemX: 0,
    startItemY: 0,
    startVecAngle: 0,
    startDist: 1,
  });

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const getTouches = (e: GestureResponderEvent) => e.nativeEvent.touches;

  const angleBetween = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
    (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

  const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          onSelect();

          const touches = getTouches(e);
          gesture.current.startItemX = item.x;
          gesture.current.startItemY = item.y;
          gesture.current.startScale = item.scale;
          gesture.current.startRotation = item.rotation;

          if (touches.length === 1) {
            const t = touches[0];
            gesture.current.startX = t.pageX;
            gesture.current.startY = t.pageY;

            // double-tap detection
            const now = Date.now();
            if (now - tapRef.current.lastTap < 250) {
              onDoubleTap();
            }
            tapRef.current.lastTap = now;
          } else if (touches.length >= 2) {
            const p1 = { x: touches[0].pageX, y: touches[0].pageY };
            const p2 = { x: touches[1].pageX, y: touches[1].pageY };
            gesture.current.startDist = dist(p1, p2);
            gesture.current.startVecAngle = angleBetween(p1, p2);
          }
        },
        onPanResponderMove: (e, g) => {
          const touches = getTouches(e);

          if (touches.length === 1) {
            // drag
            const dx = g.moveX - gesture.current.startX;
            const dy = g.moveY - gesture.current.startY;

            const nx = clamp(gesture.current.startItemX + dx, -bounds.width, bounds.width * 2);
            const ny = clamp(gesture.current.startItemY + dy, -bounds.height, bounds.height * 2);

            onUpdate({ x: nx, y: ny });
          } else if (touches.length >= 2) {
            const p1 = { x: touches[0].pageX, y: touches[0].pageY };
            const p2 = { x: touches[1].pageX, y: touches[1].pageY };

            const currentDist = dist(p1, p2);
            const scaleFactor = currentDist / Math.max(1, gesture.current.startDist);
            const newScale = clamp(gesture.current.startScale * scaleFactor, 0.3, 6);

            const currentAngle = angleBetween(p1, p2);
            const deltaAngle = currentAngle - gesture.current.startVecAngle;
            const newRotation = gesture.current.startRotation + deltaAngle;

            onUpdate({ scale: newScale, rotation: newRotation });
          }
        },
        onPanResponderRelease: () => { },
        onPanResponderTerminationRequest: () => true,
      }),
    [item, bounds]
  );

  return (
    <View
      style={[
        styles.itemWrap,
        {
          transform: [
            { translateX: item.x },
            { translateY: item.y },
            { rotate: `${item.rotation}deg` },
            { scale: item.scale },
          ],
        },
      ]}
      {...pan.panHandlers}
    >
      <View
        style={[
          styles.itemInner,
          isSelected && styles.itemSelected,
        ]}
        pointerEvents="none"
      >
        <Text
          style={{
            fontSize: item.fontSize,
            color: item.type === 'text' ? item.color : undefined,
          }}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    position: "absolute",
    height: "100%",
    width: "100%",
    top: 0,
    right: 0,
    overflow: "hidden"
  },
  topBar: {
    height: 56,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  topBtn: { color: '#fff', fontSize: 16 },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  canvasWrap: { flex: 1,  position:"relative" },
  canvas: {
    flex: 1,
    borderWidth: 10,
    borderColor: "green",
    backgroundColor: '#111',
    overflow: 'hidden',
   
  },
  tools: { padding: 16, position: "absolute" },
  row: { flexDirection: 'row', alignItems: 'center', columnGap: 12 },
  toolBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  toolTxt: { color: '#fff', fontSize: 16 },
  emojiBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
    borderColor: '#333',
  },
  label: { color: '#aaa', marginBottom: 6 },
  sliderTrack: {
    height: 6,
    backgroundColor: '#222',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sliderFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#4c9cff',
    borderRadius: 6,
    left: 0,
    top: 0,
  },
  sliderKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    top: -5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000a',
    justifyContent: 'center',
    padding: 16,
  },
  editorBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
  },
  input: {
    minHeight: 80,
    color: '#fff',
    fontSize: 20,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  itemWrap: {
    position: 'absolute',
    // The item’s own anchor is its top-left (simple & predictable)
  },
  itemInner: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  itemSelected: {
    borderWidth: 1,
    borderColor: '#4c9cff',
    borderRadius: 6,
  },
});
