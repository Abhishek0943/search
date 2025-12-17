import { Pressable, View } from "react-native";
import { responsiveScreenWidth } from "react-native-responsive-dimensions";
import { lightColors } from "../constants/values";
const colors = lightColors;

const CheckBox = ({ value, fun }: { value: boolean; fun: () => void }) => {
    return (
      <Pressable
        onPress={fun}
        style={{
          width: responsiveScreenWidth (4),
          backgroundColor: value ? colors.activeColor : 'transparent',
          aspectRatio: 1,
          borderWidth: 2,
          borderColor: value ? colors.activeColor : colors.secondaryText,
          borderRadius: '20%',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
        {value && (
          <View
            style={{
              borderBottomWidth: 2,
              borderLeftWidth: 2,
              transform: [{ rotateZ: '-45deg' }],
              borderColor: colors.bgMain,
              aspectRatio: 2 / 1,
              width: '90%',
              position: 'absolute',
              bottom: 5,
            }}></View>
        )}
      </Pressable>
    );
  };
  export default CheckBox