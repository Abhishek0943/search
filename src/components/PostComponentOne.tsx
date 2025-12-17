import { Image, StyleSheet, Text, View } from "react-native"
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from "react-native-responsive-dimensions"
import imagePath from "../constants/imagePath"
import { fonts, lightColors } from "../constants/values"
import { IsFollow } from "../pages/Search/Search"
import PostComponentPart from "./PostComponentPart"
import { homeStyle2 } from "../pages/Home/Style"
import { useAppSelector } from "../store"
import React from "react"
const colors = lightColors
type PostComponentOneProps = {
  item: Post
}
const PostComponentOne: React.FC<PostComponentOneProps> = ({ item , refetch, count}) => {
  const { user } = useAppSelector((state) => state.userStore)
  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={{ uri: item?.user?.profile_image }}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={[homeStyle2.metaText, { color: colors.secondaryText }]}>
              {item?.user?.name}
            </Text>
            {item?.user?.tick === "blue" && (
              <View style={styles.tickWrapper}>
                <Image source={imagePath.blueTick} style={homeStyle2.image} />
              </View>
            )}
          </View>
          <Text style={styles.username}>@{item?.user?.user_name}</Text>
        </View>
        {
          item?.user?.id !== user?.id &&
          <>
            {
              !item?.user?.is_following &&
       
              
              <IsFollow refetchData={refetch} borderRadius= {100} isValue={item?.user?.is_following} id={item?.user?.id} />
            }
          </>
        }
      </View>

      <PostComponentPart item={item} />
    </>
  );
}
export default PostComponentOne
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "white",
    gap: responsiveScreenWidth(2),
    alignItems: "center",
    marginBottom: responsiveScreenHeight(0.5),
  },
  profileImageWrapper: {
    width: responsiveScreenWidth(11),
    aspectRatio: 1,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth:1, 
    borderColor:colors.lightGray
  },
  profileImage: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    backgroundColor: colors.lightGray,
  },
  userInfo: {
    flex: 2.5,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
  },
  tickWrapper: {
    width: responsiveScreenWidth(4),
    maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,
  },
  username: {
    color: colors.secondaryText,
    fontSize: responsiveScreenFontSize(1.6),
    marginTop:-responsiveScreenHeight(.2),
        fontFamily: fonts.poppins,
  },
});
