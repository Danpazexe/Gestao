import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AnimatedIcon = ({ name, color, type }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;
    // Reset do valor da animação
    scaleValue.setValue(0);
    
    let animation;
    
    if (type === 'error') {
      animation = Animated.sequence([
        // Entrada com pop
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 3
        }),
        // Shake repetitivo
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        )
      ]);
    } else if (type === 'success') {
      animation = Animated.sequence([
        Animated.spring(scaleValue, {
          toValue: 1.3,
          useNativeDriver: true,
          tension: 200,
          friction: 3
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 5
        })
      ]);
    } else {
      animation = Animated.sequence([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 3
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            })
          ])
        )
      ]);
    }

    if (mounted.current) {
      animation.start();
    }

    return () => {
      mounted.current = false;
      animation.stop();
      scaleValue.setValue(0);
    };
  }, [type, name]); // Adicionado name como dependência

  return (
    <View style={styles.iconWrapper}>
      <Animated.View 
        style={{ 
          transform: [{ scale: scaleValue }],
        }}
      >
        <Icon name={name} size={32} color={color} />
      </Animated.View>
    </View>
  );
};

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <AnimatedIcon 
            key={Date.now()} // Força recriação do componente
            name="check-circle" 
            color="#fff" 
            type="success" 
          />
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
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <AnimatedIcon 
            key={Date.now()} // Força recriação do componente
            name="alert-circle" 
            color="#fff" 
            type="error" 
          />
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
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <AnimatedIcon 
            key={Date.now()} // Força recriação do componente
            name="information" 
            color="#fff" 
            type="info" 
          />
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
    minHeight: 70,
    maxHeight: 150,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorToast: {
    backgroundColor: '#F44336',
    borderLeftColor: '#D32F2F',
    height: 'auto',
    minHeight: 70,
    maxHeight: 150,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoToast: {
    backgroundColor: '#2196F3',
    borderLeftColor: '#1976D2',
    height: 'auto',
    minHeight: 70,
    maxHeight: 150,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    paddingHorizontal: 15,
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  iconContainer: {
    paddingLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  }
}); 