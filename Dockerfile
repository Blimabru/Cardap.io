# ==============================================================================
# DOCKERFILE - CONTAINERIZAÇÃO DO APLICATIVO REACT NATIVE WEB
# ==============================================================================
#
# Este Dockerfile cria uma imagem Docker para executar o Cardap.io na versão web.
# 
# FUNCIONALIDADES:
# - Executa o app React Native na versão web via Expo
# - Otimizado para produção com Node.js Alpine (leve)
# - Configurado para aceitar conexões externas
# - Porta customizada (9500) para evitar conflitos
#
# USO:
# docker build -t cardapio-web .
# docker run -p 9500:9500 cardapio-web
#
# ACESSO:
# http://localhost:9500

# Imagem base: Node.js 20 com Alpine Linux (versão leve e segura)
# Alpine: ~5MB vs Ubuntu: ~60MB - otimizada para containers
FROM node:20-alpine

# Define diretório de trabalho dentro do container
# Todos os comandos subsequentes serão executados neste diretório
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimização de cache)
# Se package.json não mudou, Docker reutiliza a camada com node_modules
# Isso acelera builds subsequentes significativamente
COPY package*.json ./

# Instala todas as dependências do projeto
# npm ci seria mais rápido em produção, mas npm install é mais compatível
# --production poderia ser usado para instalar só dependências de produção
RUN npm install

# Copia todo o restante do código fonte do projeto
# Feito após npm install para aproveitar cache de dependências
# .dockerignore deve excluir node_modules, .git, etc.
COPY . .

# Define variáveis de ambiente para o container
# CI=true: Indica ambiente de Integração Contínua (desabilita interações)
ENV CI=true
# PORT=9500: Define porta customizada para evitar conflito com outras apps
# Porta padrão do Expo Web é 8080, usamos 9500 para separação
ENV PORT=9500 

# Expõe a porta 9500 para acesso externo ao container
# Esta é a porta que deve ser mapeada ao executar o container
# Exemplo: docker run -p 9500:9500 nome-da-imagem
EXPOSE 9500

# Comando executado quando o container iniciar
# npx expo start --web: Inicia o app na versão web
# --port 9500: Define porta específica
# --host 0.0.0.0: Permite conexões de qualquer IP (não apenas localhost)
CMD ["npx", "expo", "start", "--web", "--port", "9500", "--host", "lan"]