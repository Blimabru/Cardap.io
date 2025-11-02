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
    <View>
      <Text style={styles.headerTitle}>Entregar em</Text>
      <Text style={styles.headerSubtitle}>Rua Exemplo, 123</Text>
    </View>
    
    
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
  headerTitle: {
    fontSize: 14,
    color: '#888',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    backgroundColor: '#E0E0E0', 
  },
});

export default HomeHeader;