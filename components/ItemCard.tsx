import { MaterialIcons as Icon } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


type ItemData = {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  rating: string | number; 
};

type ItemCardProps = {
  item: ItemData;
  onAddToCart?: () => void;
};

const ItemCard = ({ item, onAddToCart }: ItemCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  // Verificar se imageUrl é válida
  const hasValidImage = item.imageUrl && item.imageUrl.trim() !== '';
  
  return (
    <TouchableOpacity style={styles.itemCard}>
      {hasValidImage && !imageError ? (
        <View style={styles.itemImageContainer}>
          {!imageLoaded && (
            <View style={styles.imageLoadingPlaceholder}>
              <ActivityIndicator size="small" color="#999" />
            </View>
          )}
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.itemImage, { opacity: imageLoaded ? 1 : 0 }]}
            resizeMode="cover"
            onLoad={() => {
              setImageLoaded(true);
            }}
            onError={(error) => {
              console.warn('❌ Erro ao carregar imagem:', {
                url: item.imageUrl,
                produto: item.name,
                error: error.nativeEvent?.error || error,
              });
              setImageError(true);
            }}
          />
        </View>
      ) : (
        <View style={[styles.itemImage, styles.placeholderImage]}>
          <Icon name="image" size={40} color="#999" />
          <Text style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}

    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemPrice}>
        R$ {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}
      </Text>
    </View>

    <View style={styles.itemFooter}>
      <View style={styles.itemRatingContainer}>
        <Icon name="star" size={14} color="#FFD700" />
        <Text style={styles.itemRating}>
          {typeof item.rating === 'number' 
            ? item.rating.toFixed(1).replace('.', ',')
            : parseFloat(String(item.rating)).toFixed(1).replace('.', ',')
          }
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
    // Tamanho fixo para garantir consistência
    width: Platform.OS === 'web' ? 280 : '48%', // Web: 280px fixo, Mobile: 48% da largura (2 colunas)
    minWidth: Platform.OS === 'web' ? 280 : 160, // Largura mínima
    maxWidth: Platform.OS === 'web' ? 280 : '48%', // Largura máxima
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: Platform.OS === 'web' ? 10 : '1%',
    // Sombra - usar boxShadow no web para evitar warning
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  itemImageContainer: {
    position: 'relative',
    width: '100%',
    height: Platform.OS === 'web' ? 200 : 140, // Aumentado de 120 para 140 no mobile
    minHeight: Platform.OS === 'web' ? 200 : 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  itemImage: {
    // Tamanho fixo para garantir que a imagem ocupe todo o espaço
    height: Platform.OS === 'web' ? 200 : 140, // Aumentado de 120 para 140 no mobile
    width: '100%',
    minHeight: Platform.OS === 'web' ? 200 : 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  imageLoadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  itemInfo: {
    padding: Platform.OS === 'web' ? 15 : 12, // Aumentado de 10 para 12 no mobile
    minHeight: Platform.OS === 'web' ? 80 : 70, // Aumentado de 60 para 70 no mobile
    flexShrink: 0, // Garantir que não encolha
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