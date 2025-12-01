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
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listarCategorias } from '../../services/categorias.service';
import { atualizarProduto, criarProduto, deletarProduto, listarProdutos } from '../../services/produtos.service';
import { Categoria, Produto } from '../../types';

export default function GerenciarProdutosScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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

  // Função para criar estilos dinâmicos baseados no tamanho da tela
  const createDynamicStyles = (
    screenWidth: number,
    isSmallScreen: boolean,
    isMediumScreen: boolean,
    isLargeScreen: boolean
  ) => {
    // Padding horizontal responsivo
    const horizontalPadding = isSmallScreen 
      ? 12 
      : isMediumScreen 
      ? 14 
      : isLargeScreen
      ? 16
      : Math.min(16, screenWidth * 0.039);

    // Tamanhos de fonte responsivos
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const smallFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

    // Tamanhos de imagem responsivos
    const imageSize = isSmallScreen ? 60 : isMediumScreen ? 65 : isLargeScreen ? 70 : Math.min(70, screenWidth * 0.17);

    return StyleSheet.create({
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: horizontalPadding,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      headerTitle: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      lista: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      produtoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      },
      produtoImagem: {
        width: imageSize,
        height: imageSize,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
        flexShrink: 0,
      },
      produtoInfo: {
        flex: 1,
        marginLeft: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        justifyContent: 'center',
        minWidth: 0,
      },
      produtoNome: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      produtoCategoria: {
        fontSize: smallFontSize,
        color: '#999',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      produtoPreco: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: 'bold',
        color: '#4CAF50',
      },
      produtoAcoes: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginLeft: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexShrink: 0,
      },
      botaoEditar: {
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
      },
      botaoDeletar: {
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
      },
      emptyContainer: {
        padding: isSmallScreen ? 36 : isMediumScreen ? 42 : isLargeScreen ? 48 : Math.min(48, screenWidth * 0.117),
        alignItems: 'center',
      },
      emptyText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginBottom: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        textAlign: 'center',
      },
      botaoAdicionar: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderRadius: 8,
      },
      botaoAdicionarText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
      modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        width: '100%',
        maxWidth: '100%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: horizontalPadding,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      modalTitle: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      modalContent: {
        flex: 1,
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      inputContainer: {
        marginBottom: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        width: '100%',
        maxWidth: '100%',
      },
      label: {
        fontSize: labelFontSize,
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        fontSize: bodyFontSize,
        color: '#333',
        width: '100%',
        maxWidth: '100%',
      },
      textArea: {
        minHeight: isSmallScreen ? 70 : isMediumScreen ? 75 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195),
        textAlignVertical: 'top',
      },
      categoriaChip: {
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      categoriaChipSelecionada: {
        backgroundColor: '#333',
      },
      categoriaChipText: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
      },
      categoriaChipTextSelecionada: {
        color: '#FFF',
        fontWeight: '600',
      },
      modalFooter: {
        padding: horizontalPadding,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      botaoSalvar: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        alignItems: 'center',
        width: '100%',
      },
      botaoSalvarText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
      },
      errorText: {
        fontSize: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        fontWeight: 'bold',
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
      },
      linkText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#2196F3',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  // Tamanhos de ícones dinâmicos
  const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const addIconSize = isSmallScreen ? 24 : isMediumScreen ? 26 : isLargeScreen ? 28 : Math.min(28, screenWidth * 0.068);
  const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
  const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

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
    <View style={dynamicStyles.produtoCard}>
      <Image source={{ uri: item.imageUrl }} style={dynamicStyles.produtoImagem} />
      
      <View style={dynamicStyles.produtoInfo}>
        <Text style={dynamicStyles.produtoNome}>{item.name}</Text>
        <Text style={dynamicStyles.produtoCategoria}>{item.category.name}</Text>
        <Text style={dynamicStyles.produtoPreco}>R$ {Number(item.price).toFixed(2)}</Text>
      </View>

      <View style={dynamicStyles.produtoAcoes}>
        <TouchableOpacity
          style={dynamicStyles.botaoEditar}
          onPress={() => abrirModal(item)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="edit" size={actionIconSize} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.botaoDeletar}
          onPress={() => {
            console.log('🗑️ TouchableOpacity pressionado!');
            handleDeletar(item);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete" size={actionIconSize} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!podeGerenciar) {
    return (
      <View style={styles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Icon name="block" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Acesso Negado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={dynamicStyles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={headerIconSize} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Gerenciar Produtos</Text>
        <TouchableOpacity onPress={() => abrirModal()}>
          <Icon name="add-circle" size={addIconSize} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="inventory" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhum produto cadastrado</Text>
              <TouchableOpacity
                style={dynamicStyles.botaoAdicionar}
                onPress={() => abrirModal()}
              >
                <Text style={dynamicStyles.botaoAdicionarText}>Adicionar Primeiro Produto</Text>
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
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalHeader}>
            <TouchableOpacity onPress={fecharModal}>
              <Icon name="close" size={modalIconSize} color="#333" />
            </TouchableOpacity>
            <Text style={dynamicStyles.modalTitle}>
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <View style={{ width: modalIconSize }} />
          </View>

          <ScrollView style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Nome *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do produto"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Descrição</Text>
              <TextInput
                style={[dynamicStyles.input, dynamicStyles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição do produto"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Preço (R$) *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={preco}
                onChangeText={setPreco}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>URL da Imagem *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={imagemUrl}
                onChangeText={setImagemUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Categoria *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      dynamicStyles.categoriaChip,
                      categoriaId === cat.id && dynamicStyles.categoriaChipSelecionada,
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Text
                      style={[
                        dynamicStyles.categoriaChipText,
                        categoriaId === cat.id && dynamicStyles.categoriaChipTextSelecionada,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Avaliação (0-10)</Text>
              <TextInput
                style={dynamicStyles.input}
                value={avaliacao}
                onChangeText={setAvaliacao}
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={[dynamicStyles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={dynamicStyles.botaoSalvarText}>
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
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});

