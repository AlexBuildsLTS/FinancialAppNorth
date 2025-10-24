import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Cards } from '@/shared/components/Cards';
import { Picker } from '@react-native-picker/picker'; // For dropdowns

export default function LocalizationScreen() {
  const { theme: { colors } } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Placeholder for available countries and currencies
  const countries = ['United States', 'Sweden', 'United Kingdom'];
  const currencies = ['USD', 'SEK', 'GBP'];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Localization</Text>

        <Cards style={styles.Cards}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Country</Text>
          <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => setSelectedCountry(itemValue)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.textSecondary}
            >
              {countries.map((country) => (
                <Picker.Item key={country} label={country} value={country} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Currency</Text>
          <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Picker
              selectedValue={selectedCurrency}
              onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.textSecondary}
            >
              {currencies.map((currency) => (
                <Picker.Item key={currency} label={currency} value={currency} />
              ))}
            </Picker>
          </View>
        </Cards>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  Cards: {
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
