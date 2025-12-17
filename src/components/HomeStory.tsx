import { View, Text, FlatList, Alert } from 'react-native'
import React, { useContext, useState } from 'react'
import { responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions'
import Loading from './Loading'
import StoryCircle from './StoryCircle'
import { ThemeContext } from '../context/ThemeProvider'
import StoryCreator from './AddStory'

const HomeStory = () => {
    const [Visible, setVisible] = useState(false)
    const { colors } = useContext(ThemeContext)

    return (
        <View
            style={
                {
                    width: responsiveScreenWidth(96),
                    paddingVertical: responsiveScreenHeight(1),
                    marginBottom: responsiveScreenHeight(1),
                    borderBottomColor: '#D3D3D3',
                    borderBottomWidth: 0.5
                }
            }>
            <FlatList<number>
                data={[]}
                contentContainerStyle={{
                    gap: responsiveScreenWidth(2.5),
                    justifyContent: 'flex-start',
                    marginHorizontal: responsiveScreenWidth(2),
                }}
                keyExtractor={(item, index) => `StoryIcons-${item | index}`}
                horizontal
                scrollEnabled={true}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={() => {
                    return (
                        <StoryCircle setVisible={setVisible} isSeen={false} item={0} isMine={true} border={0} />
                    )
                }}
                renderItem={({ item, index }) => {
                    if (!item && item !== 0) {
                        return (
                            <Loading
                                style={{
                                    width: responsiveScreenWidth(20),
                                    aspectRatio: 1,
                                    borderRadius: 100,
                                }}
                            />
                        );
                    }
                    const isSeen = true
                    const isMine = false
                    if (index === 0) {
                        if (isMine) {
                            return <StoryCircle setVisible={setVisible} isSeen={isSeen} item={item} isMine={isMine} />
                        }
                        else {
                            return (
                                <>
                                    <StoryCircle setVisible={setVisible} isSeen={isSeen} item={item} isMine={true} border={0} />
                                    <View style={{ width: responsiveScreenWidth(2) }}></View>
                                    <StoryCircle setVisible={setVisible} isSeen={isSeen} item={item} isMine={isMine} />
                                </>
                            )
                        }
                    }
                    return (
                        <>
                            <StoryCircle setVisible={setVisible} isSeen={isSeen} item={item} isMine={isMine} />
                        </>
                    )
                }}
                ListFooterComponent={() => {
                    return (
                        <View></View>
                    )
                }}
            />
            
            {/* <Story visible={visible} setVisible={setVisible} /> */}
        </View>
    )
}

export default HomeStory