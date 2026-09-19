import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeProvider";
import { ComponentSingUp } from "./CompSingUp";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
const Signup = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ComponentSingUp type={"jobSeeker"} mainColor={colors.primary} secondaryColor={colors.primary} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}
export default Signup;


