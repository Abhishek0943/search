import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, StyleSheet, View } from 'react-native';
import { responsiveScreenWidth, responsiveScreenFontSize, responsiveScreenHeight } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
interface HomeHeaderScrollBarProps {
  list: string[];
  pages: React.ReactNode[];
}
const PageSlider: React.FC<HomeHeaderScrollBarProps> = ({ list, pages }) => {
  const ref = useRef<FlatList>(null);
  const { colors } = useContext(ThemeContext)
  const [active, setActive] = useState(0)
  useEffect(() => {
    ref.current?.scrollToIndex({
      index: active,
      animated: true,
      viewPosition: 0.5,
    });
  }, [active]);
  return (
    <>
      <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: .5, flexDirection: "row" }}>
        {list?.map((e, i) => {
          return (<Pressable key={e} onPress={() => setActive(i)} style={[styles.pressable, { paddingBottom: responsiveScreenHeight(1.5), borderColor: active === i ? colors.primary : colors.background, borderBottomWidth: 3, }]}>
            <Text style={[{
              fontSize: responsiveScreenFontSize(1.87),
              textTransform: "capitalize", color: colors.textSecondary
            }]}>
              {e}
            </Text>
          </Pressable>)

        })}
      </View>
      <FlatList
        style={{}}
        ref={ref}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", }}
        pagingEnabled
        keyExtractor={(item, index) => `PageSlider-${index}`}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { contentOffset, layoutMeasurement } = nativeEvent;
          const index = Math.round(contentOffset.x / layoutMeasurement.width);
          setActive(index);
        }}
        renderItem={({ item, index }: { item: string, index: number }) => {
          return (
            <View style={{ width: responsiveScreenWidth(100),}}>
              {pages[index]}
            </View>
          )
        }}
        initialScrollIndex={active}
        showsHorizontalScrollIndicator={false}
        data={list} horizontal bounces={false} />
    </>
  );
};

export default PageSlider;

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

});
export { styles as homeHeaderScrollBar }
