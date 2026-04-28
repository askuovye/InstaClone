# 📸 InstaClone

![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=for-the-badge\&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646cff?style=for-the-badge\&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge\&logo=javascript)
![SCSS](https://img.shields.io/badge/SCSS-Styling-cc6699?style=for-the-badge\&logo=sass)

## 🚀 Visão Geral do Projeto

**InstaClone** é uma aplicação web moderna, mobile-first, inspirada no Instagram, construída com **Vue 3** e **Vite**. O objetivo deste projeto é replicar a experiência central de uma rede social, com foco em desempenho, escalabilidade e uma arquitetura frontend limpa.

A aplicação apresenta uma interface escura e elegante, incluindo funcionalidades essenciais como autenticação, feed de posts, stories, perfil de usuário, criação de posts e muito mais — tudo projetado com forte ênfase em reutilização de componentes e manutenibilidade.

---

## 🧠 Tecnologias Utilizadas

Este projeto utiliza tecnologias modernas e boas práticas de desenvolvimento:

* **Vue 3**

  * Uso da **Composition API** para melhor organização da lógica
  * Gerenciamento reativo de estado
  * Estrutura de componentes mais limpa e reutilizável
* **Vite**

  * Servidor de desenvolvimento extremamente rápido
  * Build otimizado para produção
* **JavaScript (ES6+)**

  * Sintaxe moderna e arquitetura modular
* **SCSS**

  * Estilização avançada com variáveis, aninhamento e modularização

---

## 🏗️ Arquitetura & Design

O projeto segue uma **arquitetura modular e escalável**, facilitando a manutenção e evolução da aplicação.

### Princípios adotados:

* **Design baseado em componentes**

  * Interface dividida em pequenos componentes reutilizáveis
  * Cada componente possui uma responsabilidade única

* **Separação de responsabilidades**

  * Lógica de negócio isolada com Composition API (`setup()`)
  * Templates focados apenas na apresentação
  * Estilos organizados e escopados

* **Estrutura de pastas (orientada por domínio)**

```bash
src/
│
├── components/     # Componentes reutilizáveis
├── views/          # Páginas (rotas)
├── layouts/        # Layouts da aplicação
├── composables/    # Lógicas reutilizáveis (Composition API)
├── stores/         # Gerenciamento de estado (ex: Pinia)
├── services/       # Integração com APIs
├── router/         # Definição de rotas
├── utils/          # Funções utilitárias
```

* **Lazy Loading**

  * As views são carregadas sob demanda para melhorar performance

* **Escalabilidade**

  * Estrutura preparada para integração com backend e APIs externas

---

## ⚙️ Instalação & Execução

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clonar o repositório

```bash
git clone https://github.com/askuovye/InstaClone.git
cd InstaClone
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

### 4. Gerar build para produção

```bash
npm run build
```

---

## 📱 Funcionalidades

* 🔐 Autenticação (Login / Registro)
* 🏠 Feed de posts
* 📸 Seção de Stories
* ➕ Criação de posts
* 👤 Página de perfil
* 🔍 Página de exploração
* 🔔 Notificações
* 📄 Página detalhada de post

---

## 🛣️ Roadmap / Melhorias Futuras

Ideias para evolução do projeto:

### 🎨 UI & Estilo

* Migrar SCSS para um framework utility-first como **Tailwind CSS**
* Melhorar acessibilidade (ARIA, navegação por teclado)
* Suporte a temas (modo claro/escuro)

### 🔗 Backend

* Integração com backend (ex: **Laravel**, Node.js ou Firebase)
* Implementação de autenticação real (JWT/OAuth)
* Banco de dados persistente para usuários e posts

### ⚡ Performance & DX

* Otimização de chamadas de API
* Adição de testes (Vitest / Cypress)
* Melhor tratamento de erros e estados de loading

### 📦 Expansão de Funcionalidades

* Sistema de curtidas e comentários
* Notificações em tempo real (WebSockets)
* Chat/mensagens diretas
* Upload de mídia (imagens e vídeos)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para fazer um fork do projeto e abrir um pull request.

---

## 📄 Licença

Este projeto é open-source e está disponível sob a licença **MIT**.

---

## 💡 Considerações Finais

Este projeto serve como uma excelente base para aplicações Vue escaláveis, demonstrando boas práticas modernas com a Composition API e uma arquitetura bem estruturada.

---
