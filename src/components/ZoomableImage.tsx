
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  findNodeHandle,
  LayoutChangeEvent,
  PanResponder,
  View,
} from 'react-native';

type ZoomableImageProps = {
  uri?: string;
  imgW: number;  
  imgH: number;   
  maxScale?: number;
  minScale?: number;
  width: number; 
};
const PAN_SENSITIVITY = 1;        // 0.2–0.6 feels good
const ROTATE_SENSITIVITY = 1;     // 0.3–0.7 slower rotation
const PAN_THRESHOLD = 2;            // px to ignore tiny moves
const ZOOM_SENSITIVITY = 0.18;   // 0.12–0.25 feels good
const PINCH_THRESHOLD = 0.005;   // 0.5% per-frame ratio change
const ROTATE_THRESHOLD_DEG = 0.7;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const radToDeg = (r: number) => (r * 180) / Math.PI;
 const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  imgW,
  imgH,
  width,
  maxScale = 6,
  minScale = 0.3,
}) => {
  const height = useMemo(() => (imgH / imgW) * width, [imgH, imgW, width]);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateDeg = useRef(new Animated.Value(0)).current;
  const last = useRef({ x: 0, y: 0, scale: 1, rotate: 0 }).current;
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);
  const measureOrigin = () => {
    const node = findNodeHandle(containerRef.current);
    if (!node) return;
    containerRef.current?.measureInWindow((x: number, y: number) => {
      setOrigin({ x, y });
    });
  };
  const toLocal = (t: { pageX: number; pageY: number }) => ({
    x: t.pageX - origin.x,
    y: t.pageY - origin.y,
  });
  const prev = useRef<{
    touches: Array<{ id: number; x: number; y: number }>;
    dist?: number;
    angle?: number;
    centroid?: { x: number; y: number };
  } | null>(null);
  const setTransform = (nx: number, ny: number, ns: number, rDeg: number) => {
    translateX.setValue(nx);
    translateY.setValue(ny);
    scale.setValue(ns);
    rotateDeg.setValue(rDeg);
    last.x = nx;
    last.y = ny;
    last.scale = ns;
    last.rotate = rDeg;
  };
  const sortTwo = (a: { id: number }, b: { id: number }) => (a.id < b.id ? -1 : 1);
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y);
  const angle = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.atan2(b.y - a.y, b.x - a.x);
  const centroid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const deltaAngleUnwrapped = (prevRad: number, curRad: number) => {
    let d = curRad - prevRad;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  };
  const applyAroundFocal = (
    focal: { x: number; y: number },
    dScale: number,
    dRotDeg: number,
    dMove: { dx: number; dy: number },
    minS: number,
    maxS: number
  ) => {
    const newScale = clamp(last.scale * dScale, minS, maxS);
    const newRotDeg = last.rotate + dRotDeg;
    let nx = last.x + dMove.dx * PAN_SENSITIVITY;
    let ny = last.y + dMove.dy * PAN_SENSITIVITY;
    const sFactor = newScale / last.scale;
    nx += (1 - sFactor) * (focal.x - nx);
    ny += (1 - sFactor) * (focal.y - ny);
    const rotRad = (dRotDeg * Math.PI) / 180;
    if (rotRad !== 0) {
      const ox = focal.x - nx;
      const oy = focal.y - ny;
      const rx = ox * Math.cos(rotRad) - oy * Math.sin(rotRad);
      const ry = ox * Math.sin(rotRad) + oy * Math.cos(rotRad);
      nx += (ox - rx);
      ny += (oy - ry);
    }
    return { nx, ny, newScale, newRotDeg };
  };
  const readTouches = (evt: any) => {
    const ts = evt.nativeEvent.touches as Array<{ identifier: number; pageX: number; pageY: number }>;
    return ts.map(t => {
      const p = toLocal({ pageX: t.pageX, pageY: t.pageY });
      return { id: t.identifier, x: p.x, y: p.y };
    });
  };
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gs) =>
          Math.abs(gs.dx) > PAN_THRESHOLD || Math.abs(gs.dy) > PAN_THRESHOLD || (_evt.nativeEvent.touches?.length ?? 0) >= 2,
        onStartShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (evt) => {
          measureOrigin();
          const t = readTouches(evt);
          prev.current = { touches: t };
          if (t.length >= 2) {
            const [a, b] = [...t].sort(sortTwo);
            prev.current!.dist = dist(a, b);
            prev.current!.angle = angle(a, b);
            prev.current!.centroid = centroid(a, b);
          } else if (t.length === 1) {
          }
        },
        onPanResponderMove: (evt) => {
          const t = readTouches(evt);
          if (!prev.current || prev.current.touches.length !== t.length) {
            prev.current = { touches: t };
            if (t.length >= 2) {
              const [a, b] = [...t].sort(sortTwo);
              prev.current.dist = dist(a, b);
              prev.current.angle = angle(a, b);
              prev.current.centroid = centroid(a, b);
            }
            return;
          }
          if (t.length === 1) {
            const prevT = prev.current.touches[0];
            const curT = t[0];
            const dxRaw = curT.x - prevT.x;
            const dyRaw = curT.y - prevT.y;
            const dx = Math.abs(dxRaw) > PAN_THRESHOLD ? dxRaw * PAN_SENSITIVITY : 0;
            const dy = Math.abs(dyRaw) > PAN_THRESHOLD ? dyRaw * PAN_SENSITIVITY : 0;
            setTransform(last.x + dx, last.y + dy, last.scale, last.rotate);
            prev.current = { ...prev.current, touches: t };
          } else if (t.length >= 2) {
            const [a, b] = [...t].sort(sortTwo);
            const curDist = dist(a, b);
            const curAngle = angle(a, b);
            const curCentroid = centroid(a, b);
            const prevDist = prev.current!.dist!;
            const prevAngle = prev.current!.angle!;
            const prevCentroid = prev.current!.centroid!;
            const rawScale = prevDist ? curDist / prevDist : 1;
            const dScale = Math.abs(rawScale - 1) > PINCH_THRESHOLD ? Math.pow(rawScale, ZOOM_SENSITIVITY) : 1;
            let dRot = deltaAngleUnwrapped(prevAngle, curAngle);
            let dRotDeg = radToDeg(dRot) * ROTATE_SENSITIVITY;
            if (Math.abs(dRotDeg) < ROTATE_THRESHOLD_DEG) dRotDeg = 0;
            const dMove = { dx: curCentroid.x - prevCentroid.x, dy: curCentroid.y - prevCentroid.y };
            const { nx, ny, newScale, newRotDeg } = applyAroundFocal(
              curCentroid, dScale, dRotDeg, dMove, minScale!, maxScale!
            );
            setTransform(nx, ny, newScale, newRotDeg);
            prev.current = {
              touches: t,
              dist: curDist,
              angle: prevAngle + dRot,
              centroid: curCentroid,
            };
          }
        },
        onPanResponderRelease: () => {
          prev.current = null;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [origin.x, origin.y, minScale, maxScale]
  );
  const onLayout = (_e: LayoutChangeEvent) => {
    measureOrigin();
  };
  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale },
      {
        rotate: rotateDeg.interpolate({
          inputRange: [-1080, 1080],     
          outputRange: ['-1080deg', '1080deg'],
        }),
      },
    ] as any,
  };
  return (
    <View ref={containerRef} onLayout={onLayout} {...panResponder.panHandlers}>
      <Animated.Image
        source={{ uri }}
        style={[{ width, height }, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

export default ZoomableImage