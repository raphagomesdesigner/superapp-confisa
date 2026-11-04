# SuperApp Confisa

Site institucional do SuperApp para operações de ferragem armada. Este repositório contém a versão estática publicada, incluindo a página principal, o checkout front-end e a central de conteúdo.

- Site: https://raphagomes.com.br/superapp/
- Conteúdo: https://raphagomes.com.br/superapp/conteudo/
- 28 guias em 6 temas

## Prévia local

Com Python instalado, execute na raiz do repositório:

```powershell
python -m http.server 8000
```

Depois abra http://localhost:8000.

## Estrutura

- `index.html`, `styles.css`, `script.js`: página institucional e interações.
- `checkout-front/`: interface do checkout com seleção do plano recebida pela URL.
- `conteudo/`: hub, artigos e páginas por tema.
- `assets/`: imagens e recursos usados nas páginas.

O checkout deste pacote é a interface front-end e não inclui processamento de pagamento.
