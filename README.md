# API de Assinatura Digital

Sistema para cadastro de usuários, geração de pares de chaves criptográficas RSA, assinatura de hashes de documentos e verificação de autenticidade. A aplicação é composta por uma API construída com FastAPI e uma interface web desenvolvida em Next.js, utilizando PostgreSQL como banco de dados através do Docker.

## Tecnologias Utilizadas

* Backend: Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn
* Criptografia: RSA
* Banco de Dados: PostgreSQL
* Orquestração: Docker e Docker Compose
* Frontend: Next.js, React, Tailwind CSS

## Pré Requisitos

Certifique se de ter as seguintes ferramentas instaladas no seu ambiente de desenvolvimento:

* Docker
* Docker Compose
* Node.js

## Configurando e Executando o Projeto

### 1. Inicializando o Backend (Banco de Dados e API)

O ambiente do backend é totalmente conteinerizado. Para iniciar o banco de dados e a API, abra o terminal na raiz do diretório do backend e execute o comando abaixo.

```bash
docker-compose up --build
```

Após a construção e inicialização dos contêineres, a API estará disponível no endereço local na porta 8000. O banco de dados PostgreSQL estará rodando na rede interna do Docker.

A documentação interativa da API (Swagger) pode ser acessada em:
http://localhost:8000/docs

### 2. Inicializando o Frontend

Abra um novo terminal, navegue até o diretório correspondente ao frontend e instale as dependências da aplicação.

```bash
npm install
```

Inicie o servidor de desenvolvimento.

```bash
npm run dev
```

A interface web estará acessível no navegador através do endereço local na porta 3000.

## Estrutura da API

Abaixo estão descritos os principais endpoints expostos pelo sistema.

### Autenticação e Cadastro

* **POST** `/api/auth/register`
  Recebe credenciais de usuário.
  Persiste o usuário no banco de dados.
  Gera um par de chaves RSA (pública e privada) e vincula ao registro do usuário.

### Assinatura de Documentos

* **POST** `/api/signatures/sign`
  Recebe o identificador do usuário e o hash do documento.
  Utiliza a chave privada do usuário correspondente para gerar a assinatura digital.
  Retorna o identificador único da assinatura criada.

### Verificação e Auditoria

* **GET** `/api/signatures/verify/{sig_id}`
  Recebe o identificador da assinatura diretamente na URL.
  Recupera a chave pública vinculada ao autor da assinatura.
  Valida a integridade criptográfica da operação.
  Registra um log de auditoria no banco de dados contendo o endereço IP do requisitante, o navegador utilizado e o resultado matemático da validação.

## Estrutura de Banco de Dados

O banco de dados relacional armazena as seguintes entidades principais:

* **Users:** Credenciais de acesso aos serviços.
* **KeyPairs:** Chaves públicas e privadas geradas de forma exclusiva no momento do cadastro.
* **Signatures:** Registro das assinaturas realizadas, vinculando o hash do documento ao autor.
* **VerificationLogs:** Histórico detalhado de todas as tentativas de validação de assinaturas no sistema.
