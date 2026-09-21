# Dúvidas sobre IA

Formulário de uma página para a turma enviar dúvidas práticas sobre o uso de IA.

- `index.html` — a página, publicada pelo GitHub Pages.
- `apps-script/` — o Apps Script (projeto `clasp`) vinculado à planilha que recebe as respostas.
  A página envia por JSONP para o `/exec` do web app; o script grava na aba **Respostas**.

Mudou o script? `cd apps-script && clasp push && clasp deploy -i <deploymentId>` — com `-i` o URL `/exec` não muda.
