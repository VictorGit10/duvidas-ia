/**
 * Dúvidas sobre IA — recebe as perguntas do formulário e grava na planilha
 * à qual este script está vinculado.
 *
 * O formulário é uma página estática no GitHub Pages. Respostas do Apps Script
 * não têm cabeçalhos CORS, então a página envia por JSONP (uma tag <script>),
 * o que permite ler a confirmação. Tudo viaja na query string, por isso os
 * textos têm limite de tamanho.
 */

const SHEET_NAME = 'Respostas';
const NAME_MAX = 80;
const QUESTION_MAX = 2000;

function doGet(e) {
  const params = (e && e.parameter) || {};
  let status;
  try {
    status = save_(params);
  } catch (err) {
    console.error(err);
    status = 'error';
  }
  return respond_(params.callback, { status: status });
}

function save_(params) {
  // Campo invisível: só robôs preenchem. Finge sucesso e descarta.
  if (params.website) return 'received';

  const question = String(params.question || '').trim().slice(0, QUESTION_MAX);
  if (question.length < 3) return 'invalid';
  const name = String(params.name || '').trim().slice(0, NAME_MAX);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), plain_(name) || '(anônimo)', plain_(question)]);
  } finally {
    lock.releaseLock();
  }
  return 'received';
}

/** Impede que um texto começando com "=" vire fórmula na planilha. */
function plain_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function sheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME, 0);
    sheet.appendRow(['Enviado em', 'Nome', 'Dúvida']);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:C1').setFontWeight('bold');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 700);
    sheet.getRange('C:C').setWrap(true);
    const blank = spreadsheet.getSheetByName('Sheet1') || spreadsheet.getSheetByName('Página1');
    if (blank && blank.getLastRow() === 0) spreadsheet.deleteSheet(blank);
  }
  return sheet;
}

function respond_(callback, payload) {
  const json = JSON.stringify(payload);
  if (callback && /^[A-Za-z_$][\w$]{0,63}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ')').setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Rode uma vez no editor para autorizar o script e criar a aba de respostas. */
function setup() {
  sheet_();
}
