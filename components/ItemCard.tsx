import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

// 1. ATUALIZE O TIPO 'ItemData'
type ItemData = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  rating: string; // <-- Adicione esta linha de volta
};

type ItemCardProps = {
  item: ItemData;
};

// ... (código da largura do card)
const { width } = Dimensions.get('window');
const cardWidth = (width - 20 - 10) / 2;

const ItemCard = ({ item }: ItemCardProps) => (
  <TouchableOpacity style={styles.itemCard}>
    {/* ... (Componente Image) ... */}
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.itemImage}
      resizeMode="cover"
    />

    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemPrice}>R$ {item.price}</Text>
    </View>

    {/* 2. REVERTA O 'itemFooter' PARA O ORIGINAL */}
    <View style={styles.itemFooter}>
      <View style={styles.itemRatingContainer}>
        <Icon name="star" size={14} color="#FFD700" />
        {/* Usamos toFixed(1) para formatar (ex: 9.0) e trocamos . por , */}
        <Text style={styles.itemRating}>
          {parseFloat(item.rating).toFixed(1).replace('.', ',')}
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// 3. ADICIONE OS ESTILOS DE VOLTA
const styles = StyleSheet.create({
  // ... (outros estilos: itemCard, itemImage, itemInfo, etc.)
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
  itemImage: {
    height: 110,
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

  // --- ADICIONE ESTES ESTILOS DE VOLTA ---
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
  // --- FIM DOS ESTILOS ---

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