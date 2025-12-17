import React, { useContext } from "react"
import { ThemeContext } from "../context/ThemeProvider"
import { useAppDispatch } from "../store"
import { Pressable, Share, Text, View } from "react-native"
import UserImage from "./UserImage"
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from "react-native-responsive-dimensions"
import Icon from "../utils/Icon"
import LikeButton from "./LikeButton"
import BookmarkButton from "./BookmarkButton"
import RepostButton from "./RepostButton"
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native"
import { routes } from "../constants/values"
const PostComponent = ({ post }: { post: Post }) => {
  const { colors } = useContext(ThemeContext)
    const navigation: NavigationProp<ParamListBase> = useNavigation()
  
  return (
    <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1.2), borderBottomWidth: .6, borderBottomColor: colors.surfaces }}>
      <UserImage size={5} />
      <View style={{ flex: 1, }}>
        <View style={{ position: "relative" }}>
          <Text style={{ fontWeight: "400", textTransform: "capitalize", fontSize: responsiveScreenFontSize(2), color: colors.textPrimary }}>{post.user.name}</Text>
          <Icon icon={{ name: "dots-vertical", type: "MaterialDesignIcons" }} size={responsiveScreenFontSize(2)} style={{ color: colors.textSecondary, position: "absolute", top: 0, right: 0 }} />
        </View>
        <Text style={{ fontWeight: "400", textTransform: "capitalize", color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.6) }}>software developer · {new Date(post.createdAt).toDateString()}</Text>
        {
          post.description && <Text style={{ marginTop: responsiveScreenHeight(.2), color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>{post.description}</Text>
        }
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: responsiveScreenHeight(1) }}>
          <Pressable onPress={()=>navigation.navigate(routes.POST, {id:post._id, comment:true})} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
            <Icon icon={{ type: "MaterialDesignIcons", name: "comment-outline" }} style={{ color: colors.textSecondary, marginTop: responsiveScreenHeight(.1) }} size={responsiveScreenFontSize(1.6)} />
            <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.4) }}>210</Text>
          </Pressable>
          <RepostButton post={post} />
          <LikeButton post={post} />
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
            <Icon icon={{ type: "Feather", name: "bar-chart-2" }} style={{ color: colors.textSecondary, marginTop: responsiveScreenHeight(.1) }} size={responsiveScreenFontSize(1.8)} />
            <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.4) }}>{post.imppretion}</Text>
          </View>
          <BookmarkButton post={post} />

          <Pressable onPress={async () => {
            const result = await Share.share({
              message: `🔥 Check out this post by`,
            });
          }} style={{ flexDirection: "row", alignItems: "center", gap: responsiveScreenWidth(1) }}>
            <Icon icon={{ type: "Feather", name: 'share-2' }} style={{ color: colors.textSecondary, marginTop: responsiveScreenHeight(.1) }} size={responsiveScreenFontSize(1.8)} />
            {/* <Text style={{ color: colors.textSecondary, fontSize: responsiveScreenFontSize(1.4) }}>210</Text> */}
          </Pressable>

        </View>


      </View>



    </View>
  )
}

export default PostComponent;
