import React from 'react';
import { View, Text, Modal, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { moderateScale } from '../styles/scaling';
import imagePath from '../constants/imagePath';
import { fonts } from '../constants/values';

const StoryViewersModal = ({ visible, onClose, storyViewers, onStoryDeletePress, isMineSTory }: any) => {
    
  return (

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Viewed by {storyViewers?.length}</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:10}} > 
           {isMineSTory &&<TouchableOpacity onPress={()=>onStoryDeletePress(storyViewers)}>
             <Image style={{tintColor:'#fff'}} source={imagePath.delete} />
            </TouchableOpacity>}
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={storyViewers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.viewerItem}>
                <Image source={{ uri: item?.avatar }} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{item?.name}</Text>
                  <Text style={styles.time}>{item?.viewed_at}</Text>
                </View>
              </View>
            )}
          />
        </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#111',
    padding: 16,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    overflow:'hidden'
    // maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeText: {
    color: '#0af',
    fontFamily:fonts.medium,
    fontSize:moderateScale(15)
  },
  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  time: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default StoryViewersModal;
