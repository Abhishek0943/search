// ConfirmContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  FC,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

type ConfirmOptions = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
};

type ShowConfirmArgs = {
  message: string;
  onConfirm: () => void;
};

type ShowConfirm = (args: ShowConfirmArgs) => void;

const ConfirmContext = createContext<ShowConfirm | undefined>(undefined);

type ConfirmProviderProps = {
  children: ReactNode;
};

export const ConfirmProvider: FC<ConfirmProviderProps> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions>({
    visible: false,
    message: '',
    onConfirm: () => {},
  });

  const showConfirm: ShowConfirm = ({ message, onConfirm }) => {
    setOptions({ visible: true, message, onConfirm });
  };

  const handleCancel = () =>
    setOptions((opts) => ({ ...opts, visible: false }));

  const handleConfirm = () => {
    options.onConfirm();
    setOptions((opts) => ({ ...opts, visible: false }));
  };

  return (
    <ConfirmContext.Provider value={showConfirm}>
      {children}
      <Modal
        transparent
        visible={options.visible}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        {/* <View style={{flex:1, backgroundColor:"red", height:"100%", width:"100%"}}> */}

        <Pressable style={styles.backdrop} onPress={handleCancel}>
          <View />
        </Pressable>
        <View style={styles.modal}>
          <Text style={styles.message}>{options.message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btn} onPress={handleCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn]}
              onPress={handleConfirm}
            >
              <Text style={[styles.btnText, styles.confirmText]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* </View> */}

      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ShowConfirm => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  modal: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
  },
  confirmBtn: {
  },
  confirmText: {
    color: '#fff',
  },
});
