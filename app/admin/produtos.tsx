/**
 * Tela de Gerenciamento de Produtos
 * 
 * Permite Admin e Dono criar, editar e deletar produtos
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listarCategorias } from '../../services/categorias.service';
import { atualizarProduto, criarProduto, deletarProduto, listarProdutos } from '../../services/produtos.service';
import { Categoria, Produto } from '../../types';

export default function GerenciarProdutosScreen() {
  const router = useRouter();
  const { podeGerenciar } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [avaliacao, setAvaliacao] = useState('');

  useEffect(() => {
    if (podeGerenciar) {
      carregarDados();
    }
  }, [podeGerenciar]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [produtosData, categoriasData] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar os dados');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setNome(produto.name);
      setDescricao(produto.description || '');
      setPreco(String(produto.price));
      setImagemUrl(produto.imageUrl);
      setCategoriaId(produto.category.id);
      setAvaliacao(String(produto.rating));
    } else {
      limparForm();
    }
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setProdutoEditando(null);
    limparForm();
  };

  const limparForm = () => {
    setNome('');
    setDescricao('');
    setPreco('');
    setImagemUrl('');
    setCategoriaId('');
    setAvaliacao('0');
  };

  const handleSalvar = async () => {
    if (!nome || !preco || !imagemUrl || !categoriaId) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        name: nome,
        description: descricao,
        price: parseFloat(preco),
        imageUrl: imagemUrl,
        categoryId: categoriaId,
        rating: avaliacao ? parseFloat(avaliacao) : 0,
      };

      if (produtoEditando) {
        await atualizarProduto(produtoEditando.id, dados);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        await criarProduto(dados);
        Alert.alert('Sucesso', 'Produto criado com sucesso!');
      }

      fecharModal();
      carregarDados();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível salvar o produto');
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (produto: Produto) => {
    console.log('🗑️ Botão de deletar clicado para produto:', produto.name, 'ID:', produto.id);
    
    // Confirmação via window.confirm na web ou Alert no mobile
    const confirmar = Platform.OS === 'web' 
      ? (typeof window !== 'undefined' ? (window as any).confirm(`Deseja realmente deletar "${produto.name}"?`) : false)
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente deletar "${produto.name}"?`,
            [
              { 
                text: 'Cancelar', 
                style: 'cancel', 
                onPress: () => {
                  console.log('❌ Deleção cancelada');
                  resolve(false);
                }
              },
              {
                text: 'Deletar',
                style: 'destructive',
                onPress: () => {
                  console.log('✅ Confirmação aceita');
                  resolve(true);
                },
              },
            ]
          );
        });

    if (!confirmar) {
      console.log('❌ Usuário cancelou a deleção');
      return;
    }

    console.log('🔄 Iniciando deleção do produto ID:', produto.id);
    try {
      await deletarProduto(produto.id);
      console.log('✅ Produto deletado com sucesso no backend!');
      
      if (Platform.OS === 'web') {
        alert('Produto deletado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Produto deletado com sucesso!');
      }
      
      carregarDados();
    } catch (erro: any) {
      console.error('❌ Erro ao deletar produto:', erro);
      
      if (Platform.OS === 'web') {
        alert(`Erro: ${erro.message || 'Não foi possível deletar o produto'}`);
      } else {
        Alert.alert('Erro', erro.message || 'Não foi possível deletar o produto');
      }
    }
  };

  const renderProduto = ({ item }: { item: Produto }) => {
    const hasImageError = imageErrors[item.id] || false;

    return (
      <View style={styles.produtoCard}>
        {hasImageError || !item.imageUrl ? (
          <View style={[styles.produtoImagem, styles.placeholderImage]}>
            <Icon name="image" size={40} color="#999" />
          </View>
        ) : (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.produtoImagem}
            onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
          />
        )}
      
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome}>{item.name}</Text>
        <Text style={styles.produtoCategoria}>{item.category.name}</Text>
        <Text style={styles.produtoPreco}>R$ {Number(item.price).toFixed(2)}</Text>
      </View>

      <View style={styles.produtoAcoes}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => abrirModal(item)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoDeletar}
          onPress={() => {
            console.log('🗑️ TouchableOpacity pressionado!');
            handleDeletar(item);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lista: {
    padding: 16,
  },
  produtoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  produtoImagem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  produtoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  produtoCategoria: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  produtoPreco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  produtoAcoes: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  botaoEditar: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  botaoDeletar: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  botaoAdicionar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoAdicionarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoriaChipSelecionada: {
    backgroundColor: '#333',
  },
  categoriaChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoriaChipTextSelecionada: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoSalvarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 16,
  },
});
};