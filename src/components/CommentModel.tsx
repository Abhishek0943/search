import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { postApiCall } from '../api';
import imagePath from '../constants/imagePath';
import { lightColors } from '../constants/values';
import usePostData from '../hooks/usePostData';
import { exploreStyle } from '../pages/Explore/Style';
import CommentComponent from './CommentCommponent';
const color = lightColors;

const CommentModel = ({id, setIsComment, height}) => {
  const [comments, setComments] = useState([]);
  const ref = useRef<FlatList>(null);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [commentId, setCommentId] = useState<number>();
  const [paranetId, setParanetId] = useState<number>();
  const [selectedComment, setSelectedComment] = useState({
    id: 0,
    comment: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [commentIsLoading, setCommentIsLoading] = useState(false);
  const inputRef = useRef(null);
  const {
    mutate: onDeletePost,
  } = usePostData<Error>('/get-comments', 'post', {
    onSuccess: async res => {
      setIsLoading(false);
      if (res?.data) {
        setComments(res.data);
      }
    },
    onError: async (error: any) => {
      setIsLoading(false);
    },
  });
  const refetch = () => {
    onDeletePost({blog_id: id});
  };
  useEffect(() => {
    if (!id) return;
    onDeletePost({blog_id: id});
  }, [id]);
  return (
    <>
      <Modal
        visible={true}
        transparent={true}
        style={{justifyContent: 'flex-end'}}>
        <View style={{flex: 1,justifyContent: 'flex-end',
          //  position:"absolute", top:0, right:0, height:responsiveScreenHeight(100), width:responsiveScreenWidth(100), height
           }}>
          <View
            style={{
              height: '50%',
              backgroundColor: 'white',
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            }}>
            <Text
              style={{
                fontSize: responsiveScreenFontSize(2),
                fontWeight: '600',
                textAlign: 'center',
                marginTop: responsiveScreenHeight(1.5),
              }}>
              Comments
            </Text>
            <Pressable
              onPress={() => setIsComment(0)}
              style={{
                position: 'absolute',
                top: responsiveScreenHeight(1.5),
                right: responsiveScreenWidth(2),
              }}>
              <AntDesign
                name={'close'}
                size={responsiveScreenFontSize(2.5)}
                style={{color: 'black'}}
              />
            </Pressable>
            <View style={{flex: 1, marginTop: responsiveScreenHeight(1)}}>
              {isLoading ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                  <ActivityIndicator
                    size={responsiveScreenFontSize(3)}
                    color={'black'}
                  />
                </View>
              ) : (
                <FlatList
                  key={'main'}
                  data={[{}, ...comments]}
                  ref={ref}
                  showsVerticalScrollIndicator={false}
                  style={[{marginHorizontal: responsiveScreenWidth(2.5)}]}
                  contentContainerStyle={[
                    exploreStyle.flatListContent,
                    {paddingBottom: responsiveScreenHeight(1)},
                  ]}
                  keyExtractor={(item, index) =>
                    item?.id?.toString() + index.toString()
                  }
                  renderItem={({item, index}) => {
                    if (index === 0) {
                      return <View></View>;
                    }
                    return (
                      <CommentComponent
                        setReplyName={setReplyTo}
                        setParanetId={setParanetId}
                        item={item}
                        isReplay={false}
                        setCommentId={setCommentId}
                        setSelectedComment={setSelectedComment}
                        selectedComment={selectedComment}
                        refetch={() => onDeletePost({blog_id: id})}
                        postUserId={id}
                      />
                    );
                  }}
                />
              )}
            </View>

            <View
              style={{
                paddingHorizontal: responsiveScreenWidth(2),
                paddingVertical: responsiveScreenHeight(1),
                // borderWidth: 1,
                // borderTopColor: colors.lightGray,
                overflow: 'hidden',
              }}>
              {replyTo && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 25,
                    height: responsiveScreenHeight(3),
                    paddingHorizontal: responsiveScreenWidth(3),
                  }}>
                  <Text
                    style={{flex: 1, fontSize: responsiveScreenFontSize(1.4)}}>
                    {replyTo}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setReplyTo('');
                      setCommentId(0);
                      setParanetId(0);
                    }}
                    style={{marginRight: 8}}>
                    <Image
                      source={imagePath.cross}
                      style={{
                        tintColor: color.activeColor,
                        height: responsiveScreenHeight(2),
                        aspectRatio: 1,
                        resizeMode: 'contain',
                      }}
                    />
                  </Pressable>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  paddingHorizontal: responsiveScreenWidth(3),
                  paddingVertical: responsiveScreenHeight(1),
                }}>
                <TextInput
                  multiline={true}
                  autoFocus={true}
                  ref={inputRef}
                  placeholder="Write a comment..."
                  placeholderTextColor="#555"
                  value={comment}
                  onChangeText={e => setComment(e)}
                  style={{
                    flex: 1,
                    fontSize: responsiveScreenFontSize(1.6),
                    padding: 0,
                    marginRight: 6,
                  }}
                />

              

                <Pressable
                  onPress={async () => {
                    if (!comment) return;
                    if (commentIsLoading) return;
                    setCommentIsLoading(true);
                    if (selectedComment.id !== 0 && selectedComment.type) {
                      const res = await postApiCall<{
                        success: true;
                        message: string;
                      }>('/edit-comment-reply', {
                        id: selectedComment.id,
                        comment,
                        type: selectedComment.type,
                      });
                      if (res.success) {
                        ref.current?.scrollToIndex({
                          index: 0,
                          animated: true,
                          viewPosition: 0,
                        });
                        setSelectedComment({id: 0, comment: '', type: ''});
                        refetch();
                        setComment('');
                        setCommentId(0);
                        setParanetId(0);
                        setCommentIsLoading(false);
                        setReplyTo('');
                      }
                    } else {
                      const res = await postApiCall<{
                        success: true;
                        message: string;
                      }>('/save-comment-reply', {
                        blog_id: id,
                        parent_id: !paranetId ? null : paranetId,
                        comment,
                        comment_id: !commentId ? null : commentId,
                      });
                      if (res.success) {
                        refetch();
                        setComment('');
                        setCommentId(0);
                        setParanetId(0);
                        setReplyTo('');
                        setCommentIsLoading(false);

                        ref.current?.scrollToIndex({
                          index: 0,
                          animated: true,
                          viewPosition: 0,
                        });
                      }
                    }

                    setCommentIsLoading(false);
                  }}
                  style={{paddingLeft: 4}}>
                  <Image
                    source={imagePath.send}
                    style={{width: 26, height: 26, resizeMode: 'contain'}}
                  />
                </Pressable>
              </View>
            </View>
            
          </View>
        </View>
        
      </Modal>
    </>
  );
};

export default React.memo(CommentModel);