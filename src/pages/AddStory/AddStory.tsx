import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeProvider';
import Icon from '../../utils/Icon';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { routes } from '../../constants/values';

const OPTIONS = ['Recent', 'Photos', 'Videos', 'Albums', 'Google Photos'] as const;
type Tab = typeof OPTIONS[number];
const { GalleryModule } = NativeModules as {
  GalleryModule: { getMedia: () => Promise<MediaNode[]> };
};

async function requestAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const sdk = Number(Platform.Version);
  try {
    if (sdk >= 33) {
      const img = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES as any
      );
      const vid = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO as any
      );
      return (
        img === PermissionsAndroid.RESULTS.GRANTED ||
        vid === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE as any
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}

async function getDeviceMedia(): Promise<MediaNode[]> {
  if (Platform.OS === 'android') {
    const ok = await requestAndroidPermission();
    if (!ok) throw new Error('Permission denied');
  }
  const data = await GalleryModule.getMedia();
  return Array.isArray(data) ? data : [];
}
const AddStory: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const [selected, setSelected] = useState<Tab>('Recent');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [media, setMedia] = useState<MediaNode[]>([]);
  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<MediaNode | null>(null)
  const navigation:NavigationProp<ParamListBase> = useNavigation()
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getDeviceMedia();
        const sorted = [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        if (!mounted) return;
        setMedia(sorted);
        const byAlbum = new Map<string, { title: string; items: MediaNode[] }>();
        for (const m of sorted) {
          const id = m.albumId ?? m.albumName ?? 'unknown';
          const title = (m.albumName ?? 'Unknown') + '';
          if (!byAlbum.has(id)) byAlbum.set(id, { title, items: [] });
          byAlbum.get(id)!.items.push(m);
        }
        const built = Array.from(byAlbum.entries()).map(([id, group]) => {
          const cover = group.items[0];
          return {
            id,
            title: group.title,
            count: group.items.length,
            coverUri: cover?.uri,
            coverLocalId: cover?.localId,
          };
        });
        built.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
        setAlbums(built);
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (selected !== 'Albums') setOpenAlbumId(null);
  }, [selected]);
  const filtered = useMemo(() => {
    if (selected === 'Photos') return media.filter(m => m.type === 'image');
    if (selected === 'Videos') return media.filter(m => m.type === 'video');
    if (selected === 'Recent') return media.slice(0, 30);
    return media;
  }, [selected, media]);
  const { width } = useWindowDimensions();
  const columns = 3;
  const gap = 2;
  const horizontalPad = 0;
  const tile = Math.floor((width - horizontalPad - gap * (columns - 1)) / columns);
  const keyMedia = useCallback(
    (it: MediaNode, idx: number) => `${it.uri ?? it.localId ?? 'item'}:${idx}`,
    []
  );
  const getItemLayoutMedia = useCallback(
    (_: any, index: number) => {
      const row = Math.floor(index / columns);
      const length = tile;
      const offset = row * (tile + gap);
      return { length, offset, index };
    },
    [columns, tile, gap]
  );
  const renderMediaTile = useCallback(
    ({ item }: { item: MediaNode }) => {
      if (!item.uri) {
        return (
          <View
            style={{
              width: tile,
              height: tile,
              marginRight: gap,
              marginBottom: gap,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <Text
              style={{
                color: colors.textDisabled,
                fontSize: responsiveScreenFontSize(1.5),
                textAlign: 'center',
                paddingHorizontal: 4,
              }}
            >
              Needs thumbnail for localId
            </Text>
          </View>
        );
      }
      const isVideo = item.type === 'video';
      return (
        <Pressable
          onPress={() => {
            
            navigation.navigate(routes.STORYCREATOR, {url:item})
            // setSelectedImage(item)
          }}
          style={{
            width: tile,
            height: tile,
            marginRight: gap,
            marginBottom: gap,
            overflow: 'hidden',
            backgroundColor: colors.backgroundSecondary,
          }}
        >
          <Image
            source={{ uri: item.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
    
          {isVideo ? (
            <View
              style={{
                position: 'absolute',
                right: 6,
                bottom: 6,
                backgroundColor: 'rgba(55,55,55,0.45)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius:5, 
                gap:responsiveScreenWidth(2),
              }}
            >
             <Icon size={responsiveScreenFontSize(1.2)} icon={{type:"FontAwesome", name:"play"}} />
              <Text
                style={{
                  color: colors.white,
                  fontSize: responsiveScreenFontSize(1.3),
                  fontWeight: '600',
                }}
              >
                {fmt(item.durationSec)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [colors.backgroundSecondary, colors.textDisabled, colors.white, gap, tile]
  );

  const keyAlbum = useCallback((a: AlbumModel) => a.id, []);
  const renderAlbumTile = useCallback(
    ({ item }: { item: AlbumModel }) => {
      const showCover = !!item.coverUri;
      return (
        <Pressable
          onPress={() => setOpenAlbumId(item.id)}
          style={{
            width: tile,
            height: tile,
            marginRight: gap,
            marginBottom: gap,
            overflow: 'hidden',
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showCover ? (
            <Image
              source={{ uri: item.coverUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: responsiveScreenFontSize(1.6),
                padding: 8,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          )}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingVertical: 4,
              paddingHorizontal: 6,
            }}
          >
            <Text
              style={{
                color: colors.white,
                fontWeight: '700',
                fontSize: responsiveScreenFontSize(1.4),
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.3) }}>
              {item.count} items
            </Text>
          </View>
        </Pressable>
      );
    },
    [colors.backgroundSecondary, colors.textSecondary, colors.white, gap, tile]
  );


  const renderBody = () => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator color={colors.primary} size="small" />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: responsiveScreenHeight(1),
              fontSize: responsiveScreenFontSize(2),
            }}
          >
            Loading {selected.toLowerCase()}…
          </Text>
        </View>
      );
    }

    if (err) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: responsiveScreenFontSize(2.2),
              fontWeight: '700',
            }}
          >
            Unable to load media
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: responsiveScreenHeight(1),
              fontSize: responsiveScreenFontSize(2),
            }}
          >
            {err}
          </Text>
        </View>
      );
    }

    if (selected === 'Google Photos') {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
            Connect to Google Photos
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
            (Wire this up to your Google sign-in & picker flow)
          </Text>
        </View>
      );
    }

    if (selected === 'Albums') {
      if (openAlbumId) {
        const items = media.filter(
          (m) => (m.albumId ?? m.albumName ?? 'unknown') === openAlbumId
        );

        if (!items.length) {
          return (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
              }}
            >
              <Text style={{ color: colors.textSecondary }}>No items</Text>
            </View>
          );
        }

        return (
          <View style={{ flex: 1 }}>
            <FlatList
              data={items}
              keyExtractor={keyMedia}
              numColumns={columns}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={renderMediaTile}
              getItemLayout={getItemLayoutMedia}
            />
          </View>
        );
      }

      if (!albums.length) {
        return (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>No albums</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
              Could not derive albums. Ensure native returns albumId/albumName.
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          data={albums}
          keyExtractor={keyAlbum}
          numColumns={columns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          renderItem={renderAlbumTile}
        />
      );
    }

    if (!filtered.length) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: responsiveScreenFontSize(2.2),
              fontWeight: '700',
            }}
          >
            No items
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: responsiveScreenHeight(1),
              fontSize: responsiveScreenFontSize(2),
            }}
          >
            {selected === 'Photos'
              ? 'No images found.'
              : selected === 'Videos'
                ? 'No videos found.'
                : 'No media found.'}
          </Text>
          {media.some((m) => !m.uri && m.localId) ? (
            <Text
              style={{
                color: colors.textSecondary,
                marginTop: responsiveScreenHeight(2),
                fontSize: responsiveScreenFontSize(2),
              }}
            >
              iOS note: got localIds but no URIs. Expose getThumbnail(localId) to render.
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={keyMedia}
        numColumns={columns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderMediaTile}
        getItemLayout={getItemLayoutMedia}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: responsiveScreenHeight(2),
          paddingHorizontal: responsiveScreenWidth(3),
          paddingBottom: responsiveScreenHeight(1.5),
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaces,
        }}
      >
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.8}
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.surfaces,
            paddingHorizontal: responsiveScreenWidth(3),
            paddingVertical: responsiveScreenHeight(.8),
            gap: responsiveScreenWidth(2),
            backgroundColor: colors.backgroundSecondary,
            borderRadius:6
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              fontSize: responsiveScreenFontSize(1.8),
            }}
          >
            {selected}
          </Text>
          <Icon icon={{type:"Feather",name:"chevron-right"}}  style={{ fontSize: responsiveScreenFontSize(2.5), color: colors.textSecondary }} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>{renderBody()}</View>

      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setPickerOpen(false)}
        >
          <View />
        </Pressable>

        <View
          style={{
            position: 'absolute',
            top: 70,
            left: 12,
            right: 12,
            borderRadius: 12,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.surfaces,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: responsiveScreenFontSize(1.8),
              fontWeight: '700',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.surfaces,
            }}
          >
            Choose source
          </Text>
          {OPTIONS.map((opt) => {
            const isActive = opt === selected;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  setSelected(opt);
                  setPickerOpen(false);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: isActive ? colors.background : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                    fontSize: responsiveScreenFontSize(1.8),
                    fontWeight: '600',
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </View>
  );
};

function fmt(seconds?: number) {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default AddStory;
