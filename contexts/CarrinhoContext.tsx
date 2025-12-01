/**
 * ============================================================================
 * CARRINHOCONTEXT.TSX - CONTEXT DE GERENCIAMENTO DO CARRINHO
 * ============================================================================
 * 
 * Este context gerencia todo o estado global do carrinho de compras.
 * 
 * RESPONSABILIDADES:
 * - Adicionar/remover produtos do carrinho
 * - Atualizar quantidades e observações
 * - Calcular totais (quantidade e valor)
 * - Persistir carrinho no AsyncStorage
 * - Limpar carrinho após finalizar pedido
 * 
 * FUNCIONALIDADES:
 * - Estado global acessível em toda a aplicação
 * - Persistência automática (não perde dados ao fechar app)
 * - Validações de quantidade e duplicatas
 * - Cálculos automáticos de subtotal
 * - Loading state para sincronização
 * 
 * USO:
 * const { adicionarAoCarrinho, itens, valorSubtotal } = useCarrinho();
 * 
 * FLUXO TÍPICO:
 * 1. Usuário adiciona produto → adicionarAoCarrinho()
 * 2. Context atualiza estado e salva no AsyncStorage
 * 3. Componentes re-renderizam com novos dados
 * 4. Usuário finaliza pedido → limparCarrinho()
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// Tipos TypeScript do projeto
import { ItemCarrinho, Produto } from '../types';
// AsyncStorage para persistir carrinho localmente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para salvar/carregar carrinho do AsyncStorage
const CHAVE_CARRINHO = '@cardapio:carrinho';

// Interface que define todas as funções e dados disponíveis via context
interface CarrinhoContextData {
  // Estado do carrinho
  itens: ItemCarrinho[]; // Lista de itens no carrinho
  quantidadeTotal: number; // Soma de todas as quantidades
  valorSubtotal: number; // Valor total dos itens
  carregando: boolean; // Estado de loading inicial
  
  // Funções de manipulação
  adicionarAoCarrinho: (produto: Produto, quantidade?: number, observacoes?: string) => void;
  removerDoCarrinho: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  atualizarObservacoes: (produtoId: string, observacoes: string) => void;
  limparCarrinho: () => void;
}

// Context criado com valor padrão vazio
const CarrinhoContext = createContext<CarrinhoContextData>({} as CarrinhoContextData);

// Props do provider
interface CarrinhoProviderProps {
  children: ReactNode; // Componentes filhos que terão acesso ao context
}

export const CarrinhoProvider: React.FC<CarrinhoProviderProps> = ({ children }) => {
  // Estados locais do context
  const [itens, setItens] = useState<ItemCarrinho[]>([]); // Lista de itens
  const [carregando, setCarregando] = useState(true); // Loading inicial

  /**
   * Efeito executado uma vez ao montar o provider
   * Carrega carrinho salvo do AsyncStorage
   */
  useEffect(() => {
    carregarCarrinho();
  }, []);

  /**
   * Efeito executado sempre que itens mudam
   * Salva carrinho automaticamente no AsyncStorage (exceto durante loading inicial)
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


