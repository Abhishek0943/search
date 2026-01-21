import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { responsiveScreenWidth, responsiveScreenFontSize, responsiveScreenHeight } from 'react-native-responsive-dimensions';
import { ThemeContext } from '../context/ThemeProvider';
import Text from './Text';
interface HomeHeaderScrollBarProps {
  list: string[];
}
const PageSlider: React.FC<HomeHeaderScrollBarProps> = ({ list, setActive, active = 0 }) => {
  const ref = useRef<FlatList>(null);
  const { colors } = useContext(ThemeContext)
  useEffect(() => {
    ref.current?.scrollToIndex({
      index: active,
      animated: true,
      viewPosition: 0.5,
    });
  }, [active]);
  return (
    <>
      {/* <View style={{ borderBottomColor: colors.surfaces, borderBottomWidth: .5, flexDirection: "row" }}>
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
      </View> */}
      <FlatList
        style={{ maxHeight: responsiveScreenHeight(6) }}
        ref={ref}
        contentContainerStyle={{ paddingHorizontal:responsiveScreenWidth(2),  alignItems: "center", gap: responsiveScreenWidth(2) }}
        scrollEnabled={true}
        keyExtractor={(item, index) => `PageSlider-${index}`}
        renderItem={({ item, index }: { item: string, index: number }) => {
          return (
            <Pressable
            onPress={()=>setActive(index)}
              style={{
                justifyContent: 'center',
                borderRadius: 100,
                borderWidth: 1,
                borderColor: active === index ? colors.primary : colors.darkGray,

                gap: responsiveScreenWidth(1),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: active === index ? colors.primary : colors.white,
                paddingHorizontal: responsiveScreenWidth(5),
                paddingVertical: responsiveScreenHeight(1),
              }}
            >
              <Text style={{ color: active === index ? colors.white : colors.darkGrayNatural, fontSize: responsiveScreenFontSize(1.8) }}>
                {item}
              </Text>
            </Pressable>
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
