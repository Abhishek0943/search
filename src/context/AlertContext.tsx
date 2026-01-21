import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { ThemeContext } from "./ThemeProvider";

type AlertVariant = "alert" | "confirm";

type ShowAlertPayload = {
  title?: string;
  message: string;
  okText?: string;
};

type ShowConfirmPayload = {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;

  /**
   * ✅ Optional (default false)
   * If true, modal will NOT close immediately on OK.
   * It will wait for onOkPress to finish, then close.
   */
  waitForOk?: boolean;

  /**
   * ✅ Optional async action for OK
   * Return true => close modal and resolve(true)
   * Return false => keep modal open and resolve nothing
   */
  onOkPress?: () => Promise<boolean> | boolean;
};

type AlertState = {
  visible: boolean;
  variant: AlertVariant;
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;

  // ✅ Only used for special confirm (waitForOk = true)
  waitForOk?: boolean;
  onOkPress?: (() => Promise<boolean> | boolean) | null;
  loading?: boolean;
};

type AlertContextType = {
  showAlert: (payload: ShowAlertPayload) => void;
  showConfirm: (payload: ShowConfirmPayload) => Promise<boolean>;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within <AlertProvider />");
  return ctx;
};

export const AlertProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { colors } = useContext(ThemeContext);

  const [state, setState] = useState<AlertState>({
    visible: false,
    variant: "alert",
    title: "",
    message: "",
    okText: "OK",
    cancelText: "Cancel",
    waitForOk: false,
    onOkPress: null,
    loading: false,
  });

  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const hideAlert = useCallback(() => {
    setState((s) => ({ ...s, visible: false, loading: false, onOkPress: null, waitForOk: false }));
    confirmResolverRef.current = null;
  }, []);

  const showAlert = useCallback((payload: ShowAlertPayload) => {
    setState({
      visible: true,
      variant: "alert",
      title: payload.title ?? "Alert",
      message: payload.message,
      okText: payload.okText ?? "OK",
      cancelText: "Cancel",
      waitForOk: false,
      onOkPress: null,
      loading: false,
    });
  }, []);

  const showConfirm = useCallback((payload: ShowConfirmPayload) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setState({
        visible: true,
        variant: "confirm",
        title: payload.title ?? "Confirm",
        message: payload.message,
        okText: payload.okText ?? "Yes",
        cancelText: payload.cancelText ?? "No",
        waitForOk: payload.waitForOk ?? false,
        onOkPress: payload.onOkPress ?? null,
        loading: false,
      });
    });
  }, []);

  const onPressOk = useCallback(async () => {
    // normal alert
    if (state.variant === "alert") {
      hideAlert();
      return;
    }

    // confirm
    if (!state.waitForOk) {
      // ✅ default behavior: close immediately
      confirmResolverRef.current?.(true);
      hideAlert();
      return;
    }

    // ✅ special behavior: wait for async ok
    if (state.loading) return;

    try {
      setState((s) => ({ ...s, loading: true }));

      const shouldClose = state.onOkPress ? await state.onOkPress() : true;

      if (shouldClose) {
        confirmResolverRef.current?.(true);
        hideAlert();
      } else {
        // keep open
        setState((s) => ({ ...s, loading: false }));
      }
    } catch (e) {
      // keep open on error
      setState((s) => ({ ...s, loading: false }));
    }
  }, [hideAlert, state.variant, state.waitForOk, state.onOkPress, state.loading]);

  const onPressCancel = useCallback(() => {
    if (state.variant === "confirm" && state.loading) return; // optional: block cancel while loading
    if (state.variant === "confirm") confirmResolverRef.current?.(false);
    hideAlert();
  }, [hideAlert, state.variant, state.loading]);

  const value = useMemo(() => ({ showAlert, showConfirm, hideAlert }), [showAlert, showConfirm, hideAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}

      <Modal
        transparent
        visible={state.visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {!!state.title && <Text style={styles.title}>{state.title}</Text>}
            <Text style={styles.message}>{state.message}</Text>

            <View style={styles.row}>
              {state.variant === "confirm" && (
                <Pressable
                  disabled={!!state.loading}
                  style={[styles.btn, styles.cancel, state.loading && { opacity: 0.6 }]}
                  onPress={onPressCancel}
                >
                  <Text style={[styles.btnText, styles.cancelText]}>{state.cancelText}</Text>
                </Pressable>
              )}

              <Pressable
                disabled={!!state.loading}
                style={[
                  styles.btn,
                  styles.ok,
                  { backgroundColor: colors.primary },
                  state.loading && { opacity: 0.7 },
                ]}
                onPress={onPressOk}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {state.loading ? <ActivityIndicator color="#fff" /> : null}
                  <Text style={[styles.btnText, styles.okText]}>
                    {state.loading ? "Please wait..." : state.okText}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  message: { fontSize: 15, lineHeight: 20, color: "#333" },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 92,
    alignItems: "center",
  },
  ok: { backgroundColor: "#111" },
  cancel: { backgroundColor: "#F1F1F1" },
  btnText: { fontSize: 14, fontWeight: "700" },
  okText: { color: "#fff" },
  cancelText: { color: "#111" },
});
