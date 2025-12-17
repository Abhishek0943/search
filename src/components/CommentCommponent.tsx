import { Alert, FlatList, Image, Pressable, StyleSheet, View } from "react-native"
import React from 'react'
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from "react-native-responsive-dimensions"
import { fonts, lightColors } from "../constants/values";
import imagePath from "../constants/imagePath";
import { homeStyle2 } from "../pages/Home/Style";
import { exploreStyle } from "../pages/Explore/Style";
import { useEffect, useState } from "react";
import { postApiCall } from "../api";
import { showSuccess } from "../utils/helperFunctions";
import { useAppSelector } from "../store";
const colors = lightColors;
type CommentComponentProps = {
  isReplay: boolean,
  item: any,
  setCommentId: React.Dispatch<React.SetStateAction<number | undefined>>,
  setReplyName?: React.Dispatch<React.SetStateAction<string>>,
  commentId?: number,
  setParanetId: React.Dispatch<React.SetStateAction<number | undefined>>,
  setSelectedComment: React.Dispatch<React.SetStateAction<{
    id: number;
    comment: string;
  }>>,
  selectedComment: {
    id: number;
    comment: string;
  }
}
const CommentComponent: React.FC<CommentComponentProps> = ({
  setSelectedComment,
  selectedComment,
  postUserId,
  setReplyName, item, isReplay, setCommentId, commentId, setParanetId, refetch }) => {
  const [isSeemore, setIsSeemore] = useState(item?.reply.length < 2)
  const [likeInfo, setLikeInfo] = useState({ isLiked: false, likeCount: 0 })
  const { user } = useAppSelector((state) => state.userStore)
  useEffect(() => {
    setLikeInfo({ isLiked: item.is_liked, likeCount: item.like_count })
  }, [item])
  const handleLike = async () => {
    const res = await postApiCall<{ success: true, message: string, data: { likesCount: number, liked: boolean } }>('like', { id: item.id, type: isReplay ? 'reply' : "comment" });
    if (res.success) {
      setLikeInfo({ likeCount: res.data.likesCount, isLiked: res.data.liked })
    }
  };
  return (
    <>
      <View style={styles.commentContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item?.user?.profile_image }}
            style={styles.avatar}
          />
        </View>
        <Pressable onPress={() => {
          setSelectedComment({ id: 0, comment: "" })
        }} onLongPress={() => {
          if (user.id !== item.user.id && postUserId !== user.id) return
          setSelectedComment({ id: item.id, comment: "" })
        }} style={[styles.contentContainer, { 
          backgroundColor: "white" 
          }]}>
          <View style={styles.header}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            {item?.user?.tick === "blue" && (
              <View style={styles.tickContainer}>
                <Image source={imagePath.blueTick} style={styles.tickImage} />
              </View>
            )}
          </View>

          <Text style={styles.commentText}>{item?.comment}</Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{item.created_at||"3W"}</Text>

            <Pressable onPress={handleLike} style={styles.likeContainer}>
              
              <Image source={likeInfo?.isLiked ? imagePath.heartFill: imagePath.heart} style={[styles.icon, {}]} />
              <Text style={styles.metaText}>{likeInfo?.likeCount || 0} Likes</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (isReplay) setParanetId(item.id);
                setCommentId(commentId ? commentId : item.id);
                if (setReplyName)
                  setReplyName(`@${item.user.user_name} `)
              }}
              style={styles.replyContainer}
            >
              <Image source={imagePath.reply} style={styles.icon} />
              <Text style={styles.metaText}>Reply</Text>
            </Pressable>
          </View>

          {item?.reply.length > 0 && !isReplay && (<>
            <FlatList
              key={item.id.toString()}
              data={isSeemore ? item?.reply : item?.reply.slice(0, 1)}
              showsVerticalScrollIndicator={false}
              style={exploreStyle.flatList}
              scrollEnabled={false}
              contentContainerStyle={exploreStyle.flatListContent}
              keyExtractor={(item, index) => item.id.toString()+index.toString()}
              renderItem={({ item: item2 }) => (
                <CommentComponent
                  item={item2}
                  isReplay={true}
                  setReplyName={setReplyName}
                  setCommentId={setCommentId}
                  setParanetId={setParanetId}
                  commentId={item.id}
                  setSelectedComment={setSelectedComment}
                  selectedComment={selectedComment}
                  refetch={refetch}
                  postUserId={postUserId}
                />
              )}
            />
            {
              item?.reply.length >= 2 && <Text onPress={() => {
                setIsSeemore(!isSeemore)
              }} style={[styles.metaText, { fontFamily: fonts.poppinsSM }]}>{isSeemore ? "See Less" : "See More"}</Text>
            }

          </>
          )}
        </Pressable>
        {
          selectedComment?.id === item.id  &&
          <Pressable onPress={() => {
            setSelectedComment({ id: item.id, comment: item?.comment, type: isReplay ? 'reply' : "comment" })
          }}>
            <Image source={imagePath.edit} style={[{
              width: responsiveScreenWidth(6),
              maxWidth: 25,
              aspectRatio: 1,
              borderRadius: 100,
              backgroundColor: "white",
              resizeMode: "contain",
            }]} />
          </Pressable>

        }
        {
          selectedComment?.id === item.id &&
          <Pressable onPress={async () => {
            const res = await postApiCall<{ success: true; message: string }>(
              '/delete-comment',
              {
                comment_id: selectedComment.id,
                type: isReplay ? 'reply' : "comment"
              },
            );
            if (res.success) {
              refetch()
            }
         
          }}>

            <Image source={imagePath.delete} style={[{
              width: responsiveScreenWidth(5),
              maxWidth: 25,
              aspectRatio: 1,
              borderRadius: 100,
              backgroundColor: "white",
              resizeMode: "contain",
            }]} />
          </Pressable>

        }
      </View>

      {item?.reply.length > 0 && isReplay && (
        <FlatList
          key={item.id.toString()}

          data={item?.reply}
          showsVerticalScrollIndicator={false}
          style={exploreStyle.flatList}
          scrollEnabled={false}
          contentContainerStyle={exploreStyle.flatListContent}
          keyExtractor={(item, index) => item.id.toString()+index.toString()}
          renderItem={({ item: item2 }) => (
            <CommentComponent
              item={item2}
              isReplay={true}
              setReplyName={setReplyName}
              setCommentId={setCommentId}
              setParanetId={setParanetId}
              commentId={item.id}
              setSelectedComment={setSelectedComment}
              selectedComment={selectedComment}
              refetch={refetch}
              postUserId={postUserId}
            />
          )}
        />
      )}
    </>
  )
}
export default CommentComponent
const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    gap: responsiveScreenWidth(1),
    marginTop:responsiveScreenHeight(.2),
    alignItems: "flex-start",
    backgroundColor: "white",
  },
  avatarContainer: {
    width: responsiveScreenWidth(9),
    aspectRatio: 1,
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: "white", 
    borderWidth:1,
      borderColor:colors.lightGray
  },
  avatar: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "white",
  },
  username: {
    fontFamily: fonts.poppinsB,
    fontSize: responsiveScreenFontSize(1.7),
    color: colors.secondaryText,
  },
  tickContainer: {
    width: responsiveScreenWidth(4),
    maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,
  },
  tickImage: {
    ...homeStyle2.image,
  },
  commentText: {
    color: colors.secondaryText,
    fontSize: responsiveScreenFontSize(1.7),
    fontFamily: fonts.poppins,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    // marginTop: responsiveScreenHeight(0.5),
    gap: responsiveScreenWidth(3),
  },
  metaText: {
    color: colors.secondaryText,
    fontSize: responsiveScreenFontSize(1.4),
    fontFamily: fonts.poppins,
    marginTop: responsiveScreenHeight(0.3),
  },
  likeContainer: {
    flexDirection: "row",
    gap: responsiveScreenHeight(1),
    alignItems: "center",
  },
  replyContainer: {
    flexDirection: "row",
    gap: responsiveScreenHeight(1),
    alignItems: "center",
  },
  icon: {
    width: responsiveScreenWidth(3.5),
    maxWidth: 25,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "white",
    resizeMode: "contain",
  },
});
