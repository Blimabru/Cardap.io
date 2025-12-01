/**
 * Context do Carrinho
 * 
 * Gerencia itens do carrinho de compras
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ItemCarrinho, Produto } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_CARRINHO = '@cardapio:carrinho';

interface CarrinhoContextData {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  valorSubtotal: number;
  adicionarAoCarrinho: (produto: Produto, quantidade?: number, observacoes?: string) => void;
  removerDoCarrinho: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  atualizarObservacoes: (produtoId: string, observacoes: string) => void;
  limparCarrinho: () => void;
  carregando: boolean;
}

const CarrinhoContext = createContext<CarrinhoContextData>({} as CarrinhoContextData);

interface CarrinhoProviderProps {
  children: ReactNode;
}

export const CarrinhoProvider: React.FC<CarrinhoProviderProps> = ({ children }) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregando, setCarregando] = useState(true);

  /**
   * Carrega carrinho do AsyncStorage ao iniciar
   */
  useEffect(() => {
    carregarCarrinho();
  }, []);

  /**
   * Salva carrinho no AsyncStorage sempre que mudar
   */
  useEffect(() => {
    if (!carregando) {
      salvarCarrinho();
    }
  }, [itens]);

  const carregarCarrinho = async () => {
    try {
      const carrinhoString = await AsyncStorage.getItem(CHAVE_CARRINHO);
      if (carrinhoString) {
        const carrinhoSalvo = JSON.parse(carrinhoString);
        setItens(carrinhoSalvo);
      }
    } catch (erro) {
      console.error('Erro ao carregar carrinho:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const salvarCarrinho = async () => {
    try {
      await AsyncStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
    } catch (erro) {
      console.error('Erro ao salvar carrinho:', erro);
    }
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
    <CarrinhoContext.Provider
      value={{
        itens,
        quantidadeTotal,
        valorSubtotal,
        adicionarAoCarrinho,
        removerDoCarrinho,
        atualizarQuantidade,
        atualizarObservacoes,
        limparCarrinho,
        carregando,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

/**
 * Hook para usar o contexto do carrinho
 */
export const useCarrinho = (): CarrinhoContextData => {
  const context = useContext(CarrinhoContext);
  
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  
  return context;
};


