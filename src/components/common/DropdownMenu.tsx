import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TouchableOpacity } from 'react-native';

type MenuItem = {
  key: string;
  label: string;
  onPress?: () => void;
};

type DropdownMenuProps = {
  trigger?: React.ReactNode;
  items?: MenuItem[];
  style?: any;
};

export default function DropdownMenu({ trigger, items = [], style }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const onSelect = (item: MenuItem) => {
    setOpen(false);
    if (item.onPress) item.onPress();
  };

  return (
    <>
      <Pressable onPress={() => setOpen(v => !v)} style={style}>
        {trigger ?? <Text style={styles.triggerText}>⋯</Text>}
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {items.length === 0 ? (
              <Text style={styles.empty}>No options</Text>
            ) : (
              items.map(it => (
                <TouchableOpacity key={it.key} onPress={() => onSelect(it)} style={styles.item}>
                  <Text style={styles.itemText}>{it.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerText: { fontSize: 20, padding: 6 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 10,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 160,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 14,
    color: '#111',
  },
  empty: {
    padding: 12,
    color: '#666',
  },
});
