/**
 * Tela de Registro
 * 
 * Permite que novos usuários se cadastrem como clientes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegistroScreen() {
  const router = useRouter();
  const { registro } = useAuth();

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRegistro = async () => {
    // Validações
    if (!nomeCompleto || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCarregando(true);
    try {
      await registro({
        nome_completo: nomeCompleto,
        email,
        senha,
        telefone: telefone || undefined,
      });
      router.replace('/(tabs)');
    } catch (erro: any) {
      Alert.alert(
        'Erro ao criar conta',
        erro.message || 'Ocorreu um erro. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Logo Cardap.io */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Crie sua conta gratuitamente</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="João Silva"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              editable={!carregando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!carregando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 99999-9999"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              editable={!carregando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, carregando && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
            disabled={carregando}
          >
            <Text style={styles.linkText}>
              Já tem conta? <Text style={styles.linkTextBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 280,
    height: 120,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
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
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    fontWeight: '600',
    color: '#333',
  },
});

