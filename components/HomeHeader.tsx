import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image 
} from 'react-native';


const profileImageUrl = 'https://noticiasdatv.uol.com.br/media/_versions/everybody-hates-chris-julius-dia-dos-pais_fixed_large.jpg';

const HomeHeader = () => (
  <View style={styles.header}>
    {/* Logo Cardap.io no header */}
    <Image
      source={require('../assets/images/Logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    
    <Image
      source={{ uri: profileImageUrl }}
      style={styles.profileIcon}
      resizeMode="cover" 
    />
  </View>
);

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
});

export default HomeHeader;