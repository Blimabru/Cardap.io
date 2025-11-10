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
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategorias } from '../../services/categorias.service';
import { Categoria } from '../../types';

export default function GerenciarCategoriasScreen() {
  const router = useRouter();
  const { podeGerenciar } = useAuth();

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
    <View style={styles.categoriaCard}>
      <View style={styles.categoriaIconContainer}>
        <Icon name="category" size={32} color="#333" />
      </View>
      
      <View style={styles.categoriaInfo}>
        <Text style={styles.categoriaNome}>{item.name}</Text>
      </View>

      <View style={styles.categoriaAcoes}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => abrirModal(item)}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoDeletar}
          onPress={() => handleDeletar(item)}
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
        <Text style={styles.headerTitle}>Gerenciar Categorias</Text>
        <TouchableOpacity onPress={() => abrirModal()}>
          <Icon name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="category" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={() => abrirModal()}
              >
                <Text style={styles.botaoAdicionarText}>Adicionar Primeira Categoria</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </Text>
              <TouchableOpacity onPress={fecharModal}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome da Categoria *</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex: Hambúrgueres, Bebidas..."
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.botaoSalvarText}>
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
  categoriaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoriaIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoriaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoriaAcoes: {
    flexDirection: 'row',
  },
  botaoEditar: {
    padding: 8,
    marginRight: 8,
  },
  botaoDeletar: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
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

