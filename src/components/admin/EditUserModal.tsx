import * as React from 'react';
import { JSX } from 'react';
import { Modal, View, Text, StyleSheet, Button } from 'react-native';

type Props = {
  visible?: boolean;
  onClose?: () => void;
 
};

export default function EditUserModal({ visible = false, onClose = () => {} }: Props): JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Edit User</Text>
          <Text style={styles.subtitle}>Temporary stub modal — replace with real implementation</Text>
          <View style={styles.actions}>
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
