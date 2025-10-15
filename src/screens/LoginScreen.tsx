import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { login } from '../services/auth_service';
import { useAuthStore } from '../store/auth_store';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();

  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Oops 💌', 'Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email ✉️', 'Please enter a valid email address.');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Oops 🔒', 'Please enter your password.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        'Too short 🪫',
        'Password must be at least 6 characters long.',
      );
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        // RootNavigator otomatis akan redirect ke MainNavigator
      } else {
        Alert.alert('Login failed 💔', res.error?.message || 'Unknown error');
      }
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
        <Image
          source={{
            uri: 'https://i.pinimg.com/originals/6f/f5/93/6ff593ea6f8f943b308e5b3cf48ff99f.png',
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>AnimeExplorer 🌸</Text>

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

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupText}>
            Don’t have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' },
  innerContainer: { marginHorizontal: 24, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 20, borderRadius: 60 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00b4d8',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#00b4d8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signupText: { color: '#aaa', fontSize: 14 },
  link: { color: '#00b4d8', fontWeight: '600' },
});
