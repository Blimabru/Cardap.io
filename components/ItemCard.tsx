import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image, // 1. Importe o componente Image
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

// 2. Atualize o tipo 'ItemData' para incluir a imagem
type ItemData = {
  id: string;
  name: string;
  price: string;
  rating: string;
  imageUrl: string; // <- Adicione esta linha
};

type ItemCardProps = {
  item: ItemData;
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 20 - 10) / 2;

const ItemCard = ({ item }: ItemCardProps) => (
  <TouchableOpacity style={styles.itemCard}>
    {/* 3. Substitua o <View> pela <Image> */}
    <Image
      source={{ uri: item.imageUrl }} // Usa o link do mockData
      style={styles.itemImage}
      resizeMode="contain"
    />

    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemPrice}>R$ {item.price}</Text>
    </View>

    <View style={styles.itemFooter}>
      <View style={styles.itemRatingContainer}>
        <Icon name="star" size={14} color="#FFD700" />
        <Text style={styles.itemRating}>{item.rating}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 5, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  // 4. Renomeie e estilize o 'itemImage'
  itemImage: {
    height: 110,
    width: '100%', // Para ocupar toda a largura do card
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E0E0E0', // Cor de fundo enquanto a imagem carrega
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
    backgroundColor: '#E0E0E0',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ItemCard;