import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, Button, View, StyleSheet } from 'react-native';

interface BankDetails {
  transactionAmount: number | null;
  balanceAmount: number | null;
}

const extractBankDetails = (text: string): BankDetails => {
  const transactionMatch = text.match(/Transaction Rs ([\d,.]+)/i);
  const balanceMatch = text.match(/Balance available Rs ([\d,.]+)/i);

  const transactionAmount = transactionMatch ? parseFloat(transactionMatch[1].replace(/,/g, '')) : null;
  const balanceAmount = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : null;

  return {
    transactionAmount,
    balanceAmount,
  };
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<BankDetails | null>(null);

  const handleExtract = () => {
    const details = extractBankDetails(inputText);
    setResult(details);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Bank SMS Extractor</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste your bank SMS here"
        value={inputText}
        onChangeText={setInputText}
        multiline
      />
      <Button title="Extract Details" onPress={handleExtract} />
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Transaction Amount: {result.transactionAmount !== null ? `Rs ${result.transactionAmount}` : 'Not found'}
          </Text>
          <Text style={styles.resultText}>
            Remaining Balance: {result.balanceAmount !== null ? `Rs ${result.balanceAmount}` : 'Not found'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default App;
