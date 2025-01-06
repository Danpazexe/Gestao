import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="check-circle" size={24} color="#fff" />
        </View>
      )}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="alert-circle" size={24} color="#fff" />
        </View>
      )}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="information" size={24} color="#fff" />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    backgroundColor: '#4CAF50',
    borderLeftColor: '#388E3C',
    height: 'auto',
    minHeight: 60,
    maxHeight: 120,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorToast: {
    backgroundColor: '#F44336',
    borderLeftColor: '#D32F2F',
    height: 'auto',
    minHeight: 60,
    maxHeight: 120,
    paddingVertical: 10,
    borderRadius: 8,
  },
  infoToast: {
    backgroundColor: '#2196F3',
    borderLeftColor: '#1976D2',
    height: 'auto',
    minHeight: 60,
    maxHeight: 120,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  text2: {
    fontSize: 14,
    color: '#fff',
  },
  iconContainer: {
    paddingLeft: 15,
    justifyContent: 'center',
  },
}); 