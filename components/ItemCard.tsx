import { MaterialIcons as Icon } from '@expo/vector-icons';
import React, { useState } from 'react';
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

const ItemCard = ({ item, onAddToCart }: ItemCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.itemCard}>
      {imageError || !item.imageUrl ? (
        <View style={[styles.itemImage, styles.placeholderImage]}>
          <Icon name="image" size={40} color="#999" />
        </View>
      ) : (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}

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
};


const styles = StyleSheet.create({
  itemCard: {
    // MOBILE: Flex 1 para ocupar metade da tela (2 colunas)
    // WEB: Largura fixa de 280px para cards consistentes
    flex: Platform.OS === 'web' ? 0 : 1,
    width: Platform.OS === 'web' ? 280 : undefined,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 5,
    // Sombra mais suave
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  itemImage: {
    // Altura proporcional: Web maior, mobile menor
    height: Platform.OS === 'web' ? 200 : 120,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    padding: Platform.OS === 'web' ? 15 : 10,
    minHeight: Platform.OS === 'web' ? 80 : 60,
  },
  itemName: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Platform.OS === 'web' ? 18 : 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 15 : 10,
    paddingBottom: Platform.OS === 'web' ? 15 : 10,
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
    width: Platform.OS === 'web' ? 36 : 28,
    height: Platform.OS === 'web' ? 36 : 28,
    borderRadius: Platform.OS === 'web' ? 18 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    // Web: hover effect (não funciona em mobile)
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
    }),
  },
});

export default ItemCard;