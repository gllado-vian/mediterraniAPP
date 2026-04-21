import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/utils/useAuth';
import authService from '@/src/services/firebaseService';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('¿Seguro que quieres cerrar sesión?')) return;
      await authService.signOut();
      router.replace('/(auth)/login');
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Seguro que quieres salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar sesión',
            style: 'destructive',
            onPress: async () => {
              await authService.signOut();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F0',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A7C2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  email: {
    fontSize: 16,
    color: '#11181C',
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
});
