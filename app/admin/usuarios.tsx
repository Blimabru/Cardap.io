/**
 * Tela de Gerenciamento de Usuários
 * 
 * Permite apenas Admin criar, editar e gerenciar usuários
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Usuario, Perfil } from '../../types';
import { 
  listarUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  desativarUsuario, 
  reativarUsuario 
} from '../../services/usuarios.service';
import { listarPerfis } from '../../services/perfis.service';

export default function GerenciarUsuariosScreen() {
  const router = useRouter();
  const { usuario: usuarioLogado, ehAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState('Cliente');

  useEffect(() => {
    if (ehAdmin) {
      carregarUsuarios();
    }
  }, [ehAdmin]);

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      console.log('📡 Carregando usuários e perfis...');
      
      const [usuariosData, perfisData] = await Promise.all([
        listarUsuarios(),
        listarPerfis(),
      ]);
      
      console.log('✅ Usuários carregados:', usuariosData.length);
      console.log('✅ Perfis carregados:', perfisData.map(p => p.nome_perfil));
      
      setUsuarios(usuariosData);
      setPerfis(perfisData);
    } catch (erro: any) {
      console.error('❌ Erro ao carregar dados:', erro);
      
      if (Platform.OS === 'web') {
        alert(`Erro: ${erro.message || 'Não foi possível carregar dados'}`);
      } else {
        Alert.alert('Erro', erro.message || 'Não foi possível carregar dados');
      }
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = (usuario?: Usuario) => {
    console.log('📝 Abrindo modal para', usuario ? 'EDITAR' : 'CRIAR', 'usuário');
    
    if (usuario) {
      console.log('✏️ Carregando dados do usuário:', usuario.nome_completo);
      setUsuarioEditando(usuario);
      setNome(usuario.nome_completo);
      setEmail(usuario.email);
      setTelefone(usuario.telefone || '');
      setSenha('');
      setPerfilSelecionado(usuario.perfil.nome_perfil);
    } else {
      console.log('➕ Modal de criar novo usuário');
      limparForm();
    }
    setModalVisivel(true);
    console.log('✅ Modal deve estar visível agora');
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setUsuarioEditando(null);
    limparForm();
  };

  const limparForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setSenha('');
    setPerfilSelecionado('Cliente');
  };

  const handleSalvar = async () => {
    console.log('💾 Botão Salvar clicado!');
    console.log('📝 Dados do formulário:', { nome, email, telefone, senha: senha ? '***' : '', perfilSelecionado });
    
    if (!nome || !email) {
      const mensagem = 'Nome e email são obrigatórios';
      if (Platform.OS === 'web') {
        alert(mensagem);
      } else {
        Alert.alert('Atenção', mensagem);
      }
      return;
    }

    if (!usuarioEditando && !senha) {
      const mensagem = 'Senha é obrigatória para novo usuário';
      if (Platform.OS === 'web') {
        alert(mensagem);
      } else {
        Alert.alert('Atenção', mensagem);
      }
      return;
    }

    setSalvando(true);
    try {
      // Busca o ID do perfil selecionado na lista de perfis
      const perfilEncontrado = perfis.find(p => p.nome_perfil === perfilSelecionado);
      console.log('🔍 Buscando perfil:', perfilSelecionado);
      console.log('📋 Perfis disponíveis:', perfis.map(p => ({ nome: p.nome_perfil, id: p.id })));
      console.log('✅ Perfil encontrado:', perfilEncontrado);
      
      if (!perfilEncontrado) {
        throw new Error(`Perfil "${perfilSelecionado}" não encontrado. Perfis disponíveis: ${perfis.map(p => p.nome_perfil).join(', ')}`);
      }
      
      const idPerfil = perfilEncontrado.id;
      console.log('🔑 ID do perfil selecionado:', idPerfil);

      if (usuarioEditando) {
        console.log('✏️ Atualizando usuário existente ID:', usuarioEditando.id);
        const dados: any = {
          nome_completo: nome,
          email,
          telefone: telefone || undefined,
          id_perfil: idPerfil,
        };
        
        if (senha) {
          dados.nova_senha = senha;
        }

        await atualizarUsuario(usuarioEditando.id, dados);
        console.log('✅ Usuário atualizado com sucesso!');
        
        if (Platform.OS === 'web') {
          alert('Usuário atualizado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
        }
      } else {
        console.log('➕ Criando novo usuário...');
        const dadosNovoUsuario = {
          nome_completo: nome,
          email,
          senha,
          telefone: telefone || undefined,
          id_perfil: idPerfil,
        };
        console.log('📤 Enviando para API:', { ...dadosNovoUsuario, senha: '***' });
        
        await criarUsuario(dadosNovoUsuario);
        console.log('✅ Usuário criado com sucesso!');
        
        if (Platform.OS === 'web') {
          alert('Usuário criado com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Usuário criado com sucesso!');
        }
      }

      fecharModal();
      carregarUsuarios();
    } catch (erro: any) {
      console.error('❌ Erro ao salvar usuário:', erro);
      
      if (Platform.OS === 'web') {
        alert(`Erro: ${erro.message || 'Não foi possível salvar o usuário'}`);
      } else {
        Alert.alert('Erro', erro.message || 'Não foi possível salvar o usuário');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarStatus = async (usuario: Usuario) => {
    const acao = usuario.ativo ? 'desativar' : 'reativar';
    console.log('🔄 Alterando status do usuário:', usuario.nome_completo, 'Ação:', acao);
    
    const confirmar = Platform.OS === 'web'
      ? window.confirm(`Deseja ${acao} ${usuario.nome_completo}?`)
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            `${acao === 'desativar' ? 'Desativar' : 'Reativar'} Usuário`,
            `Deseja ${acao} ${usuario.nome_completo}?`,
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              {
                text: acao === 'desativar' ? 'Desativar' : 'Reativar',
                onPress: () => resolve(true),
              },
            ]
          );
        });

    if (!confirmar) {
      console.log('❌ Alteração de status cancelada');
      return;
    }

    try {
      console.log('📡 Chamando API para', acao, 'usuário...');
      if (acao === 'desativar') {
        await desativarUsuario(usuario.id);
      } else {
        await reativarUsuario(usuario.id);
      }
      console.log('✅ Status alterado com sucesso!');
      
      const mensagem = `Usuário ${acao === 'desativar' ? 'desativado' : 'reativado'}!`;
      if (Platform.OS === 'web') {
        alert(mensagem);
      } else {
        Alert.alert('Sucesso', mensagem);
      }
      
      carregarUsuarios();
    } catch (erro: any) {
      console.error('❌ Erro ao alterar status:', erro);
      
      if (Platform.OS === 'web') {
        alert(`Erro: ${erro.message}`);
      } else {
        Alert.alert('Erro', erro.message);
      }
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => {
    const corPerfil = 
      item.perfil.nome_perfil === 'Administrador' ? '#F44336' :
      item.perfil.nome_perfil === 'Dono' ? '#FF9800' : '#2196F3';

    return (
      <View style={[styles.usuarioCard, !item.ativo && styles.usuarioInativo]}>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNome}>{item.nome_completo}</Text>
          <Text style={styles.usuarioEmail}>{item.email}</Text>
          <View style={[styles.perfilBadge, { backgroundColor: corPerfil }]}>
            <Text style={styles.perfilText}>{item.perfil.nome_perfil}</Text>
          </View>
        </View>

        <View style={styles.usuarioAcoes}>
          <TouchableOpacity
            style={styles.botaoAcao}
            onPress={() => abrirModal(item)}
          >
            <Icon name="edit" size={20} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoAcao}
            onPress={() => handleAlterarStatus(item)}
          >
            <Icon 
              name={item.ativo ? 'toggle-on' : 'toggle-off'} 
              size={20} 
              color={item.ativo ? '#4CAF50' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!ehAdmin) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="block" size={80} color="#DDD" />
        <Text style={styles.errorText}>Acesso Negado</Text>
        <Text style={styles.errorSubtext}>Apenas Administradores podem acessar</Text>
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
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        <TouchableOpacity 
          onPress={() => {
            console.log('➕ Botão de adicionar usuário clicado!');
            abrirModal();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={usuarios}
          renderItem={renderUsuario}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="people" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
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
              {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="João Silva"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Senha {usuarioEditando ? '(deixe vazio para manter)' : '*'}
              </Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Perfil *</Text>
              <View style={styles.perfilSelector}>
                {perfis.length === 0 ? (
                  <Text style={styles.carregandoPerfis}>Carregando perfis...</Text>
                ) : (
                  perfis.map((perfil) => (
                    <TouchableOpacity
                      key={perfil.id}
                      style={[
                        styles.perfilChip,
                        perfilSelecionado === perfil.nome_perfil && styles.perfilChipSelecionado,
                      ]}
                      onPress={() => {
                        console.log('🎯 Perfil selecionado:', perfil.nome_perfil);
                        setPerfilSelecionado(perfil.nome_perfil);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.perfilChipText,
                          perfilSelecionado === perfil.nome_perfil && styles.perfilChipTextSelecionada,
                        ]}
                      >
                        {perfil.nome_perfil}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
              onPress={() => {
                console.log('🖱️ TouchableOpacity do botão Salvar pressionado!');
                handleSalvar();
              }}
              disabled={salvando}
              activeOpacity={0.7}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.botaoSalvarText}>
                  {usuarioEditando ? 'Atualizar' : 'Criar'} Usuário
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
  usuarioCard: {
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
  usuarioInativo: {
    opacity: 0.5,
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  perfilBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  perfilText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  usuarioAcoes: {
    flexDirection: 'row',
  },
  botaoAcao: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
  perfilSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  perfilChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  perfilChipSelecionado: {
    backgroundColor: '#333',
  },
  perfilChipText: {
    fontSize: 14,
    color: '#666',
  },
  perfilChipTextSelecionada: {
    color: '#FFF',
    fontWeight: '600',
  },
  carregandoPerfis: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    padding: 12,
  },
  perfilChipTextSelecionado: {
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
  errorSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 16,
  },
});

