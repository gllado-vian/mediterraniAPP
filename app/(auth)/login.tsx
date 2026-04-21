import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import authService from '@/src/services/firebaseService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      await authService.signIn('test@test.com', 'test123');
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Usuario test no encontrado. Créalo en Firebase Console → Authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor rellena todos los campos');
      return;
    }
    setLoading(true);
    try {
      await authService.signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error al iniciar sesión', friendlyError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🫒</Text>
        <Text style={styles.title}>mediterraniAPP</Text>
        <Text style={styles.subtitle}>Tu planificador de menú mediterráneo</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9BA1A6"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9BA1A6"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta? <Text style={styles.linkAccent}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>

        {__DEV__ && (
          <TouchableOpacity style={styles.devButton} onPress={handleTestLogin}>
            <Text style={styles.devButtonText}>⚡ Entrar como test</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'El email no es válido';
    case 'auth/user-not-found': return 'No existe ninguna cuenta con ese email';
    case 'auth/wrong-password': return 'Contraseña incorrecta';
    case 'auth/too-many-requests': return 'Demasiados intentos. Espera un momento';
    default: return 'Ha ocurrido un error. Inténtalo de nuevo';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F0',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D5016',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1E8C7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#11181C',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4A7C2F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#687076',
  },
  linkAccent: {
    color: '#4A7C2F',
    fontWeight: '600',
  },
  devButton: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#F0A500',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
  },
  devButtonText: {
    color: '#F0A500',
    fontSize: 14,
    fontWeight: '500',
  },
});
