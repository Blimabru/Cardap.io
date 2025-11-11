import { MaterialIcons as Icon } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';


type ItemData = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  rating: string; 
};

type ItemCardProps = {
  item: ItemData;
  onAddToCart?: () => void;
};

const ItemCard = ({ item, onAddToCart }: ItemCardProps) => (
  <TouchableOpacity style={styles.itemCard}>
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.itemImage}
      resizeMode="cover"
    />

    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemPrice}>R$ {item.price}</Text>
    </View>

    <View style={styles.itemFooter}>
      <View style={styles.itemRatingContainer}>
        <Icon name="star" size={14} color="#FFD700" />
        <Text style={styles.itemRating}>
          {parseFloat(item.rating).toFixed(1).replace('.', ',')}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onAddToCart}
      >
        <Icon name="add" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  itemCard: {
    // RESPONSIVO: Flex em vez de largura fixa
    flex: Platform.OS === 'web' ? 0 : 1,
    // Na web: largura mínima de 250px e máxima de 300px
    minWidth: Platform.OS === 'web' ? 250 : undefined,
    maxWidth: Platform.OS === 'web' ? 300 : undefined,
    // No mobile: flex 1 faz ocupar metade da tela (2 colunas)
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: Platform.OS === 'web' ? 10 : 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    // Responsivo: altura proporcional à largura
    height: Platform.OS === 'web' ? 180 : 110,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  itemInfo: {
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 5,
  },

  
  itemRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRating: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 4,
  },
  

  addButton: {
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ItemCard;