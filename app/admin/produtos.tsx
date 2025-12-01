/**
 * Tela de Gerenciamento de Produtos
 * 
 * Permite Admin e Dono criar, editar e deletar produtos
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
      ? window.confirm(`Deseja realmente deletar "${produto.name}"?`)
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

  const renderProduto = ({ item }: { item: Produto }) => (
    <View style={styles.produtoCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.produtoImagem} />
      
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

  if (!podeGerenciar) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="block" size={80} color="#DDD" />
        <Text style={styles.errorText}>Acesso Negado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
        <TouchableOpacity onPress={() => abrirModal()}>
          <Icon name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={() => abrirModal()}
              >
                <Text style={styles.botaoAdicionarText}>Adicionar Primeiro Produto</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={false}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={fecharModal}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do produto"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição do produto"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                value={preco}
                onChangeText={setPreco}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>URL da Imagem *</Text>
              <TextInput
                style={styles.input}
                value={imagemUrl}
                onChangeText={setImagemUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Categoria *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoriaChip,
                      categoriaId === cat.id && styles.categoriaChipSelecionada,
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoriaChipText,
                        categoriaId === cat.id && styles.categoriaChipTextSelecionada,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Avaliação (0-10)</Text>
              <TextInput
                style={styles.input}
                value={avaliacao}
                onChangeText={setAvaliacao}
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.botaoSalvarText}>
                  {produtoEditando ? 'Atualizar' : 'Criar'} Produto
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

