import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ListRenderItemInfo,
  Image,
  Pressable,
} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { HOST, routes } from '../../constants/values';
import { useAppDispatch, } from '../../store';
import { ThemeContext } from '../../context/ThemeProvider';
import { capitalizeFirstLetter } from '../../helper';
import LinearGradient from 'react-native-linear-gradient';
import { EnvContext } from '../../context/EnvProvider';
import Icon from '../../utils/Icon';
import Text from '../../components/Text';

const WelcomeItem = React.memo(({ item }: { item: WelcomeScreenItem }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[styles.itemContainer, {borderWidth:1,borderColor:"transparent"}]}>
      <Text style={[styles.title, { color: colors.white }]}>
        {capitalizeFirstLetter(item.title)}
      </Text>
      <Text style={[styles.description, { color: colors.white }]}>
        {capitalizeFirstLetter(item.description)}
      </Text>
      <Image
        source={item.imageUrl}
        style={styles.image}
        resizeMode='contain'
      />
    </View>
  );
});

const Indicators = React.memo(({ length, activeIndex }: { length: number; activeIndex: number }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { colors } = useContext(ThemeContext);
  const dots = useMemo(
    () =>
      Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: colors.white,opacity:.7 },
            (activeIndex === i && { width: responsiveScreenWidth(9), opacity:1 } )
          ]}
        />
      )),
    [length, activeIndex, colors.primary, colors.surfaces]
  );
  return <View style={[styles.indicatorContainer, {}]}>
    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1) }}>{dots}</View>
    <Text onPress={() => navigation.navigate(routes.WELCOMETWO)} style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Skip</Text>
  </View>;
});

export const Footer = React.memo(
  ({
    onNext,
    onSkip,
    index, 
    lastIndex
  }: {
    onNext: () => void;
    onSkip: () => void;
    index: number,
    lastIndex: number
  }) => {
    const { colors, isDark } = useContext(ThemeContext);
    return (
      <View style={[styles.footerContainer, {}]}>
        {
          index > 0&& index !==lastIndex &&
          <Pressable onPress={onSkip} style={[styles.pressed, { borderRadius: "50%", aspectRatio: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.white }]}>
            <Icon icon={{ type: "Feather", name: "chevron-left" }} style={{ color: colors.primary, marginTop: responsiveScreenHeight(-.2) }} size={responsiveScreenFontSize(3)} />
          </Pressable>
        }
        <Text onPress={onNext} style={[styles.pressed, { flex:  index > 0&& index !==lastIndex ? 0 : 1, paddingHorizontal: responsiveScreenWidth(18), color: colors.primary, backgroundColor: colors.white, }]}>{index !==lastIndex?"Next":"Get Started"}</Text>
      </View>
    );
  }
);

const Welcome = () => {
  const flatListRef = useRef<FlatList<WelcomeScreenItem>>(null);
  const [index, setIndex] = useState(0);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const dispatch = useAppDispatch();
  const { env } = useContext(EnvContext);
  // const welcomeScreen = useAppSelector(state => state.userStore.welcomeScreen);
  const welcomeScreen = [
    {
      _id: "",
      imageUrl: require('./one.png'),
      title: "Search your job",
      description: "Figure out your top five priorities whether it is company culture, salary."
    },
    {
      _id: "",
      imageUrl: require('./two.png'),
      title: "Browser Job List",
      description: "Our job list include several  industries, so you can find the best job for you."
    },
    {
      _id: "",
     imageUrl: require('./three.png'),
      title: "Apply Best Jobs",
      description: "You can apply to your desirable jobs very quickly and easily with ease."
    },
    {
      _id: "",
      imageUrl: require('./four.png'),
      title: "Let’s Get Started",
      description: "Find your next opportunity or the perfect hire today"
    },
  ]
  useEffect(() => {
    if (index < welcomeScreen.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [index, welcomeScreen.length]);
  const keyExtractor = useCallback((item: WelcomeScreenItem, index: number) => `${routes.WELCOME},welcome,${index}`, []);
  const renderItem = useCallback(
    ({ item  }: ListRenderItemInfo<WelcomeScreenItem>) => <WelcomeItem  item={item} />,
    []
  );
  const handleNext = () => {
    if (index === welcomeScreen.length - 1) {
      navigation.navigate(routes.WELCOMETWO);
    } else {
      setIndex(i => i + 1);
    }
  };
  const handleSkip = () => {
    setIndex(i => i - 1);
  };
  return (
    <>
      {
        env === "dev" && <View style={{ opacity: .5, borderWidth: 1, position: "absolute", top: 0, height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), left: 0, zIndex: 100, }}>
          <Image source={require('./dev.jpg')} style={{ objectFit: "contain", height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), margin: "auto" }} />
        </View>
      }
      <LinearGradient
        colors={['#488AFB', '#7CC6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
        }}
      >
        <View style={{ flex: 1, paddingVertical: responsiveScreenHeight(5), paddingHorizontal: responsiveScreenWidth(6) }}>
          <Indicators length={welcomeScreen.length} activeIndex={index} />
          <FlatList<WelcomeScreenItem>
            ref={flatListRef}
            data={welcomeScreen}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
          />
          <Footer
            onNext={handleNext}
            onSkip={handleSkip}
            index={index}
            lastIndex={welcomeScreen.length - 1}
          />
        </View>

      </LinearGradient>

    </>
  );
};
export default Welcome;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  itemContainer: {
    width: responsiveScreenWidth(100),
    height: responsiveScreenHeight(100),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: responsiveScreenWidth(100),
    marginTop: responsiveScreenHeight(5),
  },
  title: {
    marginTop: responsiveScreenHeight(2),
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(3.5),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  description: {
    maxWidth: responsiveScreenWidth(80),
    textAlign: 'center',
    fontSize: responsiveScreenFontSize(1.95),
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveScreenWidth(0.8),
    paddingBottom: responsiveScreenHeight(4.5),
    alignItems: "center",
    marginTop: responsiveScreenHeight(2.7)
  },
  dot: {
    width: responsiveScreenWidth(1.8),
    height: responsiveScreenWidth(1.8),
    borderRadius: responsiveScreenWidth(1),
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: responsiveScreenWidth(3),
    marginBottom: responsiveScreenHeight(4),
  },
  pressed: {
    textAlign: "center",
    paddingVertical: responsiveScreenHeight(1.5),
    borderRadius: 10,
    fontSize: responsiveScreenFontSize(1.8),
    fontWeight: "500",
  },
});