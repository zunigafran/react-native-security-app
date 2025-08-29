import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const Lock = () => {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(6).fill(0)
  const router = useRouter();

  const offset = useSharedValue(0);
  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const OFFSET = 20;
  const TIME = 80;

  useEffect(() => {
    if (code.length === 6) {
      if (code.join('') === '111111') {
        router.replace('/');
        setCode([]);
      } else {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 2}),
          withRepeat(withTiming(OFFSET, { duration: TIME}), 4, true),
          withTiming(0, { duration: TIME / 2 }),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        setCode([]);
      }
    }
  }, [code]);

  const onNumberpress = (number: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode([...code, number]);
  };

  const numberBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode(code.slice(0, -1));
  };

  const onBiometricPress = async () => {
    try {
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('Biometric hardware available:', hasHardware);
      console.log('Biometric enrolled:', isEnrolled);
      
      if (!hasHardware || !isEnrolled) {
        console.log('Biometric not available or not enrolled');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('Supported auth types:', supportedTypes);
      
      // Authenticate with proper configuration
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      console.log('Authentication result:', result);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/');
      } else {
        console.log('Authentication failed:', result.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };


  return (
    <SafeAreaView>
      <Text style={styles.greeting}>Welcome back, Francisco</Text>
      <Animated.View style={[styles.codeView, style]}>
        {codeLength.map((_, index) => (
          <View key={index} style={[styles.codeEmpty,
            {
              backgroundColor: code[index] ? '#3d38ed' : '#d8dce2',
            }
          ]} />
        ))}
      </Animated.View>
      <View style={styles.numbersView}>
        <View style={styles.numPad}>
          {[1, 2, 3].map((number) => (
            <TouchableOpacity key={number} style={styles.number} onPress={() => onNumberpress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
         </View>
         <View style={styles.numPad}>
          {[4, 5, 6].map((number) => (
            <TouchableOpacity key={number} style={styles.number} onPress={() => onNumberpress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
         </View>
         <View style={styles.numPad}>
          {[7, 8, 9].map((number) => (
            <TouchableOpacity key={number} style={styles.number} onPress={() => onNumberpress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
         </View>
             <View style={styles.numpadBttm}>
          <TouchableOpacity onPress={onBiometricPress}>
            <MaterialCommunityIcons name="face-recognition" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNumberpress(0)}>
            <Text style={styles.number}>0</Text>
          </TouchableOpacity>
          <View style={{ minWidth: 30 }}>
            {code.length > 0 && (
              <TouchableOpacity onPress={numberBackspace}>
                <MaterialCommunityIcons name="backspace-outline" size={28} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 80,
    alignSelf: 'center',
  },
  codeView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 100,
  },
  codeEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  numbersView: {
    marginHorizontal: 80,
    gap: 60,
  },
  number: {
    fontSize: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numpadBttm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default Lock