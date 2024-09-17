# Visão geral do Next.js

## História

* Problema original dos SPAs:
  
  * Indexação (SEO);

* Tradicional SPA:

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-45-01-image.png" title="" alt="" data-align="center">

* O problema dessa arquitetura acima é o SEO:   
  
  * Os robôs do google que vão categorizar muitas vezes *não esperam seu front carregar todo o js para mandar requisições ao back e mostrar o conteúdo final em tela* (problemas de timeout deles);
  
  * Logo, sempre existe a chance do robô categorizar seu site considerando apenas partes dele e indexar ele mal no google, nos resultados;

* Next (SSR - Server Side Rendering):

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-49-58-image.png" title="" alt="" data-align="center">

* Nós temos um servidor nextjs em node que vai fazer as reqs para o backend, pegar o resultado, montar a pagina HTML (renderizar), isso tudo **do lado do servidor** e depois enviar isso para o front
  
  * Dessa forma, o frontend não vai carregar parte de codigo html, depois esperar codigo js com resposta retornar do back para completar a pintura;
  
  * Ele vai ficar em estado de aguardando o servidor até **TUDO ESTAR RENDERIZADO**;
    
    * E isso vai melhorar a análise para o robô e salvar o seu SEO;

* Static Site Generation(SSG):
  
  * Portal de notícias;

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-55-34-image.png" title="" alt="" data-align="center">

* Essa funcionalidade **SSG** permite fazer um cache de resultado de pagina renderizada por x tempo;
  
  * Dessa forma, se você tem muitos acessos num site de notícias, pode determinar que a página estática gerada será atualizada apenas de 10 em 10 minutos;
  
  * Então quando alguém entrar no site, você não vai precisar fazer todo o caminho (ir no back, pegar requisição, montar html, retornar html). Você só vai retornar a página em cachê mais recente;
  
  * Caso já tenha passado 10 minutos, aí o processo é refeito para atualizar a versão da página guardada em cachê;

# Mono-repo

* Conceito de manter front e backend num único repositório;

* Não significa necessariamente você ter front e back junto, é apenas uma organização de pastas;

* Turborepo: ferramenta que acelera processos do monorepo;
  
  * Comandos de build apenas para certas partes do código (ex: se eu alterei apenas o front, ele builda apenas o front);
  
  * Administração de scripts;
  
  * Criação de cache para otimizações;

* Criando um novo repo:

* ```powershell
  pnpm dlx create-turbo@latest
  ```

* Vai pedir nome do projeto...defina um da sua preferência;

* Entre na pasta do projeto e entre no vscode;
