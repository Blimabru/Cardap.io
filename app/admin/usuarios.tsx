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
  useWindowDimensions,
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
  const { width: screenWidth } = useWindowDimensions();
  const { usuario: usuarioLogado, ehAdmin } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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
    const addIconSize = isSmallScreen ? 24 : isMediumScreen ? 26 : isLargeScreen ? 28 : Math.min(28, screenWidth * 0.068);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

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
      usuarioCard: {
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
      usuarioInativo: {
        opacity: 0.5,
      },
      usuarioInfo: {
        flex: 1,
        minWidth: 0,
      },
      usuarioNome: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      usuarioEmail: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      perfilBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        paddingVertical: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
        borderRadius: 12,
      },
      perfilText: {
        fontSize: smallFontSize,
        fontWeight: '600',
        color: '#FFF',
      },
      usuarioAcoes: {
        flexDirection: 'row',
        marginLeft: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexShrink: 0,
      },
      botaoAcao: {
        padding: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        marginLeft: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      emptyContainer: {
        padding: isSmallScreen ? 36 : isMediumScreen ? 42 : isLargeScreen ? 48 : Math.min(48, screenWidth * 0.117),
        alignItems: 'center',
      },
      emptyText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
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
      perfilSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '100%',
      },
      perfilChip: {
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 8 : isMediumScreen ? 9 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024),
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      perfilChipSelecionado: {
        backgroundColor: '#333',
      },
      perfilChipText: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
      },
      perfilChipTextSelecionada: {
        color: '#FFF',
        fontWeight: '600',
      },
      carregandoPerfis: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#999',
        fontStyle: 'italic',
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
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
      errorSubtext: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#CCC',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
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
      <View style={[dynamicStyles.usuarioCard, !item.ativo && dynamicStyles.usuarioInativo]}>
        <View style={dynamicStyles.usuarioInfo}>
          <Text style={dynamicStyles.usuarioNome}>{item.nome_completo}</Text>
          <Text style={dynamicStyles.usuarioEmail}>{item.email}</Text>
          <View style={[dynamicStyles.perfilBadge, { backgroundColor: corPerfil }]}>
            <Text style={dynamicStyles.perfilText}>{item.perfil.nome_perfil}</Text>
          </View>
        </View>

        <View style={dynamicStyles.usuarioAcoes}>
          <TouchableOpacity
            style={dynamicStyles.botaoAcao}
            onPress={() => abrirModal(item)}
          >
            <Icon name="edit" size={actionIconSize} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.botaoAcao}
            onPress={() => handleAlterarStatus(item)}
          >
            <Icon 
              name={item.ativo ? 'toggle-on' : 'toggle-off'} 
              size={actionIconSize} 
              color={item.ativo ? '#4CAF50' : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!ehAdmin) {
    return (
      <View style={styles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Icon name="block" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Acesso Negado</Text>
          <Text style={dynamicStyles.errorSubtext}>Apenas Administradores podem acessar</Text>
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
        <Text style={dynamicStyles.headerTitle}>Gerenciar Usuários</Text>
        <TouchableOpacity 
          onPress={() => {
            console.log('➕ Botão de adicionar usuário clicado!');
            abrirModal();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="add-circle" size={addIconSize} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={usuarios}
          renderItem={renderUsuario}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="people" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhum usuário cadastrado</Text>
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
              {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
            </Text>
            <View style={{ width: modalIconSize }} />
          </View>

          <ScrollView style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Nome Completo *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="João Silva"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Email *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Telefone</Text>
              <TextInput
                style={dynamicStyles.input}
                value={telefone}
                onChangeText={setTelefone}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>
                Senha {usuarioEditando ? '(deixe vazio para manter)' : '*'}
              </Text>
              <TextInput
                style={dynamicStyles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Perfil *</Text>
              <View style={dynamicStyles.perfilSelector}>
                {perfis.length === 0 ? (
                  <Text style={dynamicStyles.carregandoPerfis}>Carregando perfis...</Text>
                ) : (
                  perfis.map((perfil) => (
                    <TouchableOpacity
                      key={perfil.id}
                      style={[
                        dynamicStyles.perfilChip,
                        perfilSelecionado === perfil.nome_perfil && dynamicStyles.perfilChipSelecionado,
                      ]}
                      onPress={() => {
                        console.log('🎯 Perfil selecionado:', perfil.nome_perfil);
                        setPerfilSelecionado(perfil.nome_perfil);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          dynamicStyles.perfilChipText,
                          perfilSelecionado === perfil.nome_perfil && dynamicStyles.perfilChipTextSelecionada,
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

          <View style={dynamicStyles.modalFooter}>
            <TouchableOpacity
              style={[dynamicStyles.botaoSalvar, salvando && styles.botaoDesabilitado]}
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
                <Text style={dynamicStyles.botaoSalvarText}>
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
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});

