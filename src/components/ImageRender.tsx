import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  View,
} from 'react-native';
import {
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
export const isVideo = (url: string): boolean => /\.(mp4|mov|webm)(\?.*)?$/i.test(url);
import { ThemeContext } from '../context/ThemeProvider';
import Icon from '../utils/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const RenderImages = ({
  media,
  setMedia,
  type,
}: {
  media: Asset[],
  setMedia: React.Dispatch<React.SetStateAction<Asset[]>>,
  type: "Post" | "View"
}
) => {
  const { colors } = useContext(ThemeContext)
  const [isSlider, setIsSlider] = useState(false)
  const [active, setActive] = useState(0)
  const renderImage = (image: string, index: number, aspectRatio?: number,) => {
    return (
      <Pressable onPress={() => {
        setIsSlider(true)
        setActive(index)
      }} style={{
        flex: 1, minWidth: responsiveScreenWidth(40), borderWidth: 1, borderColor: colors.surfaces, borderRadius: 10,
        overflow: "hidden", aspectRatio,
        position: "relative"
      }}>{
          type === "Post" && <Icon onPress={() => { setMedia(prev => prev.filter((_, i) => i !== index)) }} style={{ position: "absolute", top: responsiveScreenHeight(1), right: responsiveScreenWidth(2), zIndex: 100 }} icon={{ name: "window-close", type: "FontAwesome" }} />
        }
        <Image source={{ uri: image }} style={{ height: "100%", width: "100%" }} />
      </Pressable>
    )
  }
  return (
    <>
      {media.length === 1 && renderImage(media[0].uri, 0, media[0]?.width / media[0]?.height)}
      {(media.length === 2) && (
        <View style={[{ borderRadius: 10, gap: responsiveScreenWidth(1), flexWrap: "wrap", overflow: 'hidden', flexDirection: "row" }]}>
          {media.map((img, index) => renderImage(img.uri, index, img.width / img.height))}
        </View>
      )}
      {media.length === 3 && (
        <View style={[{ borderRadius: 10, gap: responsiveScreenWidth(1), flexWrap: "wrap", overflow: 'hidden', flexDirection: "row" }]}>
          {renderImage(media[0].uri, 0, media[0]?.width / media[0]?.height)}
          <View style={{ gap: responsiveScreenWidth(1) }}>
            {renderImage(media[1].uri, 1, media[1]?.width / media[1]?.height)}
            {renderImage(media[2].uri, 2, media[2]?.width / media[2]?.height)}
          </View>
        </View>
      )}
      {media.length === 4 && (
        <View style={[{ borderRadius: 10, gap: responsiveScreenWidth(1), flexWrap: "wrap", overflow: 'hidden', flexDirection: "row" }]}>
          {media.map((img, index) => renderImage(img.uri, index, 1))}
        </View>
      )}
      {
        isSlider && <Slider setMedia={setMedia} setActive={setActive} setIsSlider={setIsSlider} media={media} active={active} />
      }
    </>
  );
};
const Slider = ({ media, setMedia, setIsSlider, setActive, active }: {
  media: Asset[],
  setIsSlider: React.Dispatch<React.SetStateAction<boolean>>,
  setActive: React.Dispatch<React.SetStateAction<number>>,
  active: number,
  setMedia: React.Dispatch<React.SetStateAction<Asset[]>>
}) => {
  const ref = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const maxHeight = responsiveScreenHeight(100) - insets.top - insets.bottom
  const { colors } = useContext(ThemeContext)
  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < media.length) {
      ref.current?.scrollToIndex({ index, animated: true });
      setActive(index);
    }
  };
  useEffect(() => {
    if (media.length === 0) {
      setIsSlider(false)
    }
  }, [media])
  return (

    <Modal>
      <FlatList<Asset>
        ref={ref}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", }}
        pagingEnabled
        keyExtractor={(item, index) => `ImageSlider-${index}`}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { contentOffset, layoutMeasurement } = nativeEvent;
          const index = Math.round(contentOffset.x / layoutMeasurement.width);
          setActive(index);
        }}
        renderItem={({ item, index }: { item: Asset, index: number }) => {
          return (
            <View style={{ width: responsiveScreenWidth(100), backgroundColor: colors.background, flexDirection: "column" }}>
              <View style={{
                position: "absolute",
                top: responsiveScreenHeight(1),
                right: responsiveScreenWidth(2),
                backgroundColor: colors.background,
                margin: "auto",
                zIndex: 111,
                flexDirection: "row",
                gap: responsiveScreenWidth(2)
              }}>

                <Icon onPress={() => {
                  if (media.length - 1 === index) {
                    scrollToIndex(active - 1)
                  } else {
                    scrollToIndex(active + 1)
                  }
                  setMedia(prev => prev.filter((_, i) => i !== index))
                }} icon={{ name: "delete", type: "MaterialDesignIcons" }} />
                <Icon onPress={() => setIsSlider(false)} icon={{ name: "window-close", type: "FontAwesome" }} />
              </View>
              {
                index !== 0 && <Icon onPress={() => scrollToIndex(active - 1)} style={{
                  position: "absolute",
                  top: "50%",
                  transform: [{ translateY: -12 }],
                  left: responsiveScreenWidth(2),
                  backgroundColor: colors.white,
                  borderRadius: 100,
                  margin: "auto",
                  zIndex: 111
                }} icon={{ type: "Entypo", name: "chevron-left" }} />
              }
              {
                index !== media.length - 1 && <Icon onPress={() => scrollToIndex(active + 1)} style={{
                  position: "absolute",
                  top: "50%",
                  transform: [{ translateY: -12 }],
                  right: responsiveScreenWidth(2),
                  backgroundColor: colors.white,
                  borderRadius: 100,
                  margin: "auto",
                  zIndex: 111
                }} icon={{
                  type: "Entypo", name: "chevron-right"
                }} />
              }
              <Image source={{ uri: item.uri }} style={{ width: "100%", borderWidth: .5, borderColor: colors.surfaces, maxHeight: maxHeight, margin: "auto", aspectRatio: item.width / item.height }} />
            </View>
          )
        }}
        initialScrollIndex={active}
        showsHorizontalScrollIndicator={false}
        data={media} horizontal bounces={false} />
    </Modal>
  )
}
export default RenderImages;

