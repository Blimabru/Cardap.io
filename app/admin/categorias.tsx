/**
 * Tela de Gerenciamento de Categorias
 * 
 * Permite Admin e Dono criar, editar e deletar categorias
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategorias } from '../../services/categorias.service';
import { Categoria } from '../../types';

export default function GerenciarCategoriasScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Form state
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (podeGerenciar) {
      carregarCategorias();
    }
  }, [podeGerenciar]);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const dados = await listarCategorias();
      setCategorias(dados);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar categorias');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = (categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setNome(categoria.name);
    } else {
      setCategoriaEditando(null);
      setNome('');
    }
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setCategoriaEditando(null);
    setNome('');
  };

  const handleSalvar = async () => {
    if (!nome || nome.trim().length < 3) {
      Alert.alert('Atenção', 'Nome da categoria deve ter no mínimo 3 caracteres');
      return;
    }

    setSalvando(true);
    try {
      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando.id, { name: nome });
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      } else {
        await criarCategoria({ name: nome });
        Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      }

      fecharModal();
      carregarCategorias();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível salvar a categoria');
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

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const addIconSize = isSmallScreen ? 24 : isMediumScreen ? 26 : isLargeScreen ? 28 : Math.min(28, screenWidth * 0.068);
    const categoryIconSize = isSmallScreen ? 28 : isMediumScreen ? 30 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

    // Tamanho do ícone do card
    const iconContainerSize = isSmallScreen ? 45 : isMediumScreen ? 47 : isLargeScreen ? 50 : Math.min(50, screenWidth * 0.122);

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
      categoriaCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: horizontalPadding,
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      },
      categoriaIconContainer: {
        width: iconContainerSize,
        height: iconContainerSize,
        borderRadius: iconContainerSize / 2,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      },
      categoriaInfo: {
        flex: 1,
        marginLeft: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        minWidth: 0,
      },
      categoriaNome: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: '600',
        color: '#333',
      },
      categoriaAcoes: {
        flexDirection: 'row',
        marginLeft: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexShrink: 0,
      },
      botaoEditar: {
        padding: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      botaoDeletar: {
        padding: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
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
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: horizontalPadding,
      },
      modalContainer: {
        width: '100%',
        maxWidth: isSmallScreen ? screenWidth - (horizontalPadding * 2) : isMediumScreen ? 380 : isLargeScreen ? 400 : Math.min(400, screenWidth * 0.975),
        backgroundColor: '#FFF',
        borderRadius: 12,
        maxHeight: '80%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      },
      modalTitle: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      modalContent: {
        padding: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      },
      inputContainer: {
        marginBottom: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
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
  const categoryIconSize = isSmallScreen ? 28 : isMediumScreen ? 30 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078);
  const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
  const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

  const handleDeletar = (categoria: Categoria) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente deletar a categoria "${categoria.name}"?\n\nAtenção: Só é possível deletar categorias sem produtos associados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarCategoria(categoria.id);
              Alert.alert('Sucesso', 'Categoria deletada com sucesso!');
              carregarCategorias();
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível deletar a categoria');
            }
          },
        },
      ]
    );
  };

  const renderCategoria = ({ item }: { item: Categoria }) => (
    <View style={dynamicStyles.categoriaCard}>
      <View style={dynamicStyles.categoriaIconContainer}>
        <Icon name="category" size={categoryIconSize} color="#333" />
      </View>
      
      <View style={dynamicStyles.categoriaInfo}>
        <Text style={dynamicStyles.categoriaNome}>{item.name}</Text>
      </View>

      <View style={dynamicStyles.categoriaAcoes}>
        <TouchableOpacity
          style={dynamicStyles.botaoEditar}
          onPress={() => abrirModal(item)}
        >
          <Icon name="edit" size={actionIconSize} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.botaoDeletar}
          onPress={() => handleDeletar(item)}
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
        <Text style={dynamicStyles.headerTitle}>Gerenciar Categorias</Text>
        <TouchableOpacity onPress={() => abrirModal()}>
          <Icon name="add-circle" size={addIconSize} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="category" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhuma categoria cadastrada</Text>
              <TouchableOpacity
                style={dynamicStyles.botaoAdicionar}
                onPress={() => abrirModal()}
              >
                <Text style={dynamicStyles.botaoAdicionarText}>Adicionar Primeira Categoria</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharModal}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </Text>
              <TouchableOpacity onPress={fecharModal}>
                <Icon name="close" size={modalIconSize} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.label}>Nome da Categoria *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex: Hambúrgueres, Bebidas..."
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[dynamicStyles.botaoSalvar, salvando && styles.botaoDesabilitado]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={dynamicStyles.botaoSalvarText}>
                    {categoriaEditando ? 'Atualizar' : 'Criar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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

