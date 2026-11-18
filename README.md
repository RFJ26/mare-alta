# Maré Alta · Marisqueira em Olhão

Site de uma página para um restaurante **fictício** em Olhão, Algarve. Feito só com HTML, CSS e JavaScript (módulos ES nativos), sem frameworks nem build.

## Funcionalidades

- **Menu a partir de `data/menu.json`**, com filtros por categoria e por alérgeno (os 14 da UE). Os filtros ficam no URL (`?cat=mariscos&sem=gluten`).
- **Três idiomas (PT, EN, ES)** com ficheiros JSON em `i18n/`. O idioma escolhido fica guardado e o `<html lang>` muda.
- **Reservas por WhatsApp.** O formulário valida os dados e abre `wa.me` com a mensagem formatada.
- **Indicador "Aberto agora / Fechado"** calculado no fuso `Europe/Lisbon`, mesmo que o visitante esteja noutro fuso. Aceita turnos que passam da meia-noite.
- Galeria com lightbox em `<dialog>`, mapa do OpenStreetMap carregado só a pedido e dados estruturados `schema.org/Restaurant`.

## Correr localmente

Os dados são carregados com `fetch`, por isso o site precisa de um servidor. Abrir o `index.html` com duplo clique (`file://`) não funciona.

```bash
python3 -m http.server 5510
```

Depois abre http://localhost:5510. Também serve a extensão Live Server do VS Code.

## Estrutura

```
index.html          página única, com o texto em português (funciona sem JS)
css/tokens.css      cores, fontes e espaçamentos (variáveis CSS)
css/base.css        reset, tipografia, botões
css/sections.css    estilos de cada secção (Grid e Flexbox)
js/main.js          arranque e comportamento do cabeçalho
js/i18n.js          traduções e idioma
js/menu.js          menu e filtros
js/reservas.js      formulário de reserva e WhatsApp
js/horario.js       horário, estado aberto/fechado e mapa
js/galeria.js       lightbox
data/menu.json      pratos
data/info.json      horário, contactos, morada e regras de reserva
i18n/*.json         textos em PT, EN e ES
```

## Editar conteúdos

- **Pratos:** em `data/menu.json`. O nome e a descrição levam as três línguas. `unidade` pode ser `"kg"` ou `"un"`; se não existir, o preço é por dose.
- **Horário:** em `data/info.json`. Um fecho "antes" da abertura (`"00:30"`) quer dizer depois da meia-noite. Se mudares o horário ou a morada, atualiza também o JSON-LD no `<head>` do `index.html`.
- **Textos:** nas chaves de `i18n/pt.json`, `en.json` e `es.json`. Os três ficheiros têm de ter as mesmas chaves.

## Notas

- O restaurante, o telefone, o email e o número de WhatsApp (`351000000000`) são fictícios.
- As imagens são ilustrações geradas para o projeto; podem ser trocadas por fotografias reais em WebP com os mesmos nomes.
- Fontes [Fraunces](https://github.com/undercasetype/Fraunces) e [Work Sans](https://github.com/weiweihuanghuang/Work-Sans), licença SIL Open Font License (ver `assets/fonts/`).
