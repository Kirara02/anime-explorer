import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signup } from '../services';
import { useAuthStore } from '../store';
import { AuthStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '@react-navigation/native';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // 🔹 Validasi input
  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Oops 💡', 'Please enter your full name.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Oops 💌', 'Please enter a valid email address.');
      return false;
    }

    if (!password) {
      Alert.alert('Oops 🔒', 'Please enter a password.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        'Too short 🪫',
        'Password must be at least 6 characters long.',
      );
      return false;
    }

    if (password !== confirm) {
      Alert.alert('Mismatch 💢', 'Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const res = await signup(name, email, password);

      if (res.success && res.user) {
        setUser(res.user);
        Alert.alert('Welcome ✨', 'Account created successfully!');
      } else {
        Alert.alert('Signup failed 💔', res.error?.message || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Create Account 🌸</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.signupText}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
    },
    innerContainer: {
      marginHorizontal: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 30,
    },
    input: {
      width: '100%',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      padding: 12,
      color: theme.colors.text,
      marginBottom: 15,
    },
    button: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 15,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    signupText: { color: theme.colors.text + '99', fontSize: 14 },
    link: { color: theme.colors.primary, fontWeight: '600' },
  });
