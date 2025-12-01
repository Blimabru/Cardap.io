import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const profileImageUrl = 'https://noticiasdatv.uol.com.br/media/_versions/everybody-hates-chris-julius-dia-dos-pais_fixed_large.jpg';

const HomeHeader = () => {
  const router = useRouter();
  const { autenticado, usuario } = useAuth();

  return (
    <View style={styles.header}>
      {/* Logo Cardap.io no header */}
      <Image
        source={require('../assets/images/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      {autenticado && usuario ? (
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
          <Image
            source={{ uri: usuario.foto_perfil_url || profileImageUrl }}
            style={styles.profileIcon}
            resizeMode="cover" 
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Icon name="person" size={20} color="#333" />
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  logo: {
    width: 180,
    height: 60,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    backgroundColor: '#E0E0E0', 
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeHeader;