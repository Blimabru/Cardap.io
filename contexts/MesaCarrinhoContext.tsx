/**
 * Context do Carrinho por Mesa
 * 
 * Gerencia itens do carrinho de compras para pedidos por mesa (via QR code)
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ItemCarrinho, Produto, Mesa } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_PREFIXO = '@cardapio:mesa_carrinho:';

interface MesaCarrinhoContextData {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  valorSubtotal: number;
  mesa: Mesa | null;
  idMesa: string | null;
  definirMesa: (mesa: Mesa) => void;
  adicionarAoCarrinho: (produto: Produto, quantidade?: number, observacoes?: string) => void;
  removerDoCarrinho: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  atualizarObservacoes: (produtoId: string, observacoes: string) => void;
  limparCarrinho: () => void;
  carregando: boolean;
}

const MesaCarrinhoContext = createContext<MesaCarrinhoContextData>({} as MesaCarrinhoContextData);

interface MesaCarrinhoProviderProps {
  children: ReactNode;
}

export const MesaCarrinhoProvider: React.FC<MesaCarrinhoProviderProps> = ({ children }) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [idMesa, setIdMesa] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  /**
   * Carrega carrinho do AsyncStorage ao iniciar (se houver mesa definida)
   */
  useEffect(() => {
    if (idMesa && !carregando) {
      carregarCarrinho();
    } else if (!idMesa) {
      setCarregando(false);
    }
  }, [idMesa]);

  /**
   * Salva carrinho no AsyncStorage sempre que mudar (se houver mesa definida)
   */
  useEffect(() => {
    if (!carregando && idMesa) {
      salvarCarrinho();
    }
  }, [itens, idMesa]);

  const obterChaveCarrinho = (): string => {
    if (!idMesa) {
      throw new Error('Mesa não definida');
    }
    return `${CHAVE_PREFIXO}${idMesa}`;
  };

  const carregarCarrinho = async () => {
    if (!idMesa) return;

    try {
      const chave = obterChaveCarrinho();
      const carrinhoString = await AsyncStorage.getItem(chave);
      if (carrinhoString) {
        const carrinhoSalvo = JSON.parse(carrinhoString);
        setItens(carrinhoSalvo.itens || []);
      }
    } catch (erro) {
      console.error('Erro ao carregar carrinho da mesa:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const salvarCarrinho = async () => {
    if (!idMesa) return;

    try {
      const chave = obterChaveCarrinho();
      await AsyncStorage.setItem(chave, JSON.stringify({ itens, mesa }));
    } catch (erro) {
      console.error('Erro ao salvar carrinho da mesa:', erro);
    }
  };

  /**
   * Define a mesa e carrega carrinho associado
   */
  const definirMesa = (novaMesa: Mesa) => {
    setMesa(novaMesa);
    setIdMesa(novaMesa.id);
    // Carrinho será carregado automaticamente pelo useEffect
  };

  /**
   * Adiciona produto ao carrinho
   * Se produto já existe, aumenta quantidade
   */
  const adicionarAoCarrinho = (produto: Produto, quantidade: number = 1, observacoes?: string) => {
    setItens((itensAtuais) => {
      // Verifica se produto já está no carrinho
      const itemExistente = itensAtuais.find((item) => item.produto.id === produto.id);

      if (itemExistente) {
        // Se já existe, aumenta quantidade
        return itensAtuais.map((item) =>
          item.produto.id === produto.id
            ? { 
                ...item, 
                quantidade: item.quantidade + quantidade,
                observacoes: observacoes || item.observacoes
              }
            : item
        );
      } else {
        // Se não existe, adiciona novo item
        return [
          ...itensAtuais,
          {
            produto,
            quantidade,
            observacoes,
          },
        ];
      }
    });
  };

  /**
   * Remove produto do carrinho
   */
  const removerDoCarrinho = (produtoId: string) => {
    setItens((itensAtuais) => itensAtuais.filter((item) => item.produto.id !== produtoId));
  };

  /**
   * Atualiza quantidade de um item
   * Se quantidade for 0, remove do carrinho
   */
  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  /**
   * Atualiza observações de um item
   */
  const atualizarObservacoes = (produtoId: string, observacoes: string) => {
    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.produto.id === produtoId ? { ...item, observacoes } : item
      )
    );
  };

  /**
   * Limpa todos os itens do carrinho
   */
  const limparCarrinho = () => {
    setItens([]);
  };

  /**
   * Calcula quantidade total de itens
   */
  const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);

  /**
   * Calcula valor subtotal do carrinho
   */
  const valorSubtotal = itens.reduce((total, item) => {
    const preco = typeof item.produto.price === 'string' 
      ? parseFloat(item.produto.price) 
      : item.produto.price;
    return total + (preco * item.quantidade);
  }, 0);

  return (
    <MesaCarrinhoContext.Provider
      value={{
        itens,
        quantidadeTotal,
        valorSubtotal,
        mesa,
        idMesa,
        definirMesa,
        adicionarAoCarrinho,
        removerDoCarrinho,
        atualizarQuantidade,
        atualizarObservacoes,
        limparCarrinho,
        carregando,
      }}
    >
      {children}
    </MesaCarrinhoContext.Provider>
  );
};

/**
 * Hook para usar o contexto do carrinho por mesa
 */
export const useMesaCarrinho = (): MesaCarrinhoContextData => {
  const context = useContext(MesaCarrinhoContext);
  
  if (!context) {
    throw new Error('useMesaCarrinho deve ser usado dentro de um MesaCarrinhoProvider');
  }
  
  return context;
};

