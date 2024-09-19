'use strict';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal } from 'bootstrap';
import { createApp } from 'petite-vue';
import Sortable from 'sortablejs';

const storage = localStorage;
const elementSuggestion = document.getElementById('elementSuggestion');

const DEFAULT_THEME = 'system';
const DEFAULT_WHITE_PAGE_SETTING = '2n';
const DEFAULT_ROWS = 10;

//-----------------DOM構築時--------------------
document.addEventListener('DOMContentLoaded', () => {
  //現在の年を取得
  const currentYear = new Date().getFullYear();

  //フッターのクレジットを設定
  document.getElementById('credit').textContent = `© ${currentYear} k_hiyama`;

  //年度の選択項目を設定
  const year = document.getElementById('year');
  const years = ['----', `${currentYear}年度`, `${currentYear + 1}年度`];
  years.forEach((text, index) => {
    const opt = document.createElement('option');
    opt.textContent = text;
    if (index == 0) opt.value = '';
    if (index == 1) opt.selected = true;
    year.appendChild(opt);
  });

  //項目に既定値を入れる
  setDefaultEl();

  //ローカルストレージにサジェスト設定がなければ初期化、あればそれを適用。
  if (storage.elementSuggestion == undefined) {
    initializeSug();
  } else {
    elementSuggestion.value = storage.elementSuggestion;
    setElementSug();
  }

  //項目サジェスト設定変更時
  elementSuggestion.addEventListener('change', () => {
    setElementSug();
  });
});

//サジェスト設定を初期化する関数
const initializeSug = () => {
  elementSuggestion.value = ['中扉', '白', 'テキストの構成と活用法', '目次', 'ヨヨキー'].join('\n');
  setElementSug();
};

//サジェスト設定を適用する関数
const setElementSug = () => {
  //ローカルストレージにサジェスト設定を保存
  storage.elementSuggestion = elementSuggestion.value;

  const items = elementSuggestion.value.split(/\n/).filter(Boolean);
  const itemList = document.getElementById('itemList');

  //既存の子要素（option）をすべて削除
  itemList.innerHTML = '';

  //子要素としてoptionを新たに追加していく
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item;
    itemList.appendChild(opt);
  }
};

//項目名に既定値を入れる関数
const setDefaultEl = () => {
  const elementNames = document.getElementsByName('elementName');
  const defaults = ['中扉', '白', 'テキストの構成と活用法'];
  defaults.forEach((value, index) => {
    if (elementNames[index]) elementNames[index].value = value;
  });
};

//項目入力リストをドラッグ＆ドロップで並び替えられるようにする
const el = document.getElementById('sortable');
const sortable = new Sortable(el, {
  handle: '.handle',
  animation: 150
});

//-----------------petite-vue------------------
createApp({
  //データプロパティ
  rows: DEFAULT_ROWS,
  theme: '',
  whitePageSetting: '',
  pdfMessageSetting: true,
  title: '割付表ジェネレータ',
  isChangingTitle: false,
  isChangingCredit: false,

  //メソッド
  //読み込み時に実行
  init() {
    //白追加設定。ローカルストレージの値を見る。
    this.whitePageSetting = storage.whitePageSetting ? storage.whitePageSetting : DEFAULT_WHITE_PAGE_SETTING;

    //pdf文言設定。
    this.pdfMessageSetting = storage.pdfMessageSetting !== 'off' && storage.pdfMessageSetting !== 'false';

    //テーマ設定。
    this.theme = storage.theme ? storage.theme : DEFAULT_THEME;
    this.setTheme();
  },

  //行を追加
  addRow() {
    if (this.rows >= 30) {
      const tooManyRowsModalElement = document.getElementById('tooManyRowsModal');
      const tooManyRowsModal = new Modal(tooManyRowsModalElement);
      tooManyRowsModal.show();
      return; // 行の追加を防ぐ
    }
    this.rows += 1;
  },

  //連番の入力値修正
  only3Numbers(ev) {
    const el = ev.currentTarget;

    //全角数字を半角数字に変換、数字以外を削除
    el.value = el.value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/\D/g, '');

    //文字列が0のみであれば0を代入、そうでなければ先頭の0を削除し、さらに先頭の３文字を切り出す
    const zeroOnly = /^0+$/;
    el.value = zeroOnly.test(el.value) ? '0' : el.value.replace(/^0+/, '').slice(0, 3);
  },

  //白追加設定をローカルストレージに保存
  setWhitePageSetting() {
    storage.whitePageSetting = this.whitePageSetting;
  },

  //PDF文言設定をローカルストレージに保存
  togglePdfSwitch() {
    storage.pdfMessageSetting = this.pdfMessageSetting;
  },

  //テーマ設定
  setTheme() {
    let themeToApply = this.theme;
    if (this.theme == 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = systemPrefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-bs-theme', themeToApply);
    storage.theme = this.theme;
  },

  //フォームリセット
  resetForms() {
    document.querySelectorAll('.reset').forEach((form) => {
      form.value = '';
    });
    this.rows = DEFAULT_ROWS; //項目の行数をリセット

    // DOMの更新が完了した後にsetDefaultElを実行
    this.$nextTick(() => {
      setDefaultEl();
    });
  },

  //すべての設定を初期化ボタン押下時
  toggleInitArea() {
    toggleInitArea();
  },

  //設定リセット処理
  initAllSettings() {
    this.theme = DEFAULT_THEME;
    this.setTheme();
    this.whitePageSetting = DEFAULT_WHITE_PAGE_SETTING;
    this.setWhitePageSetting();
    this.pdfMessageSetting = true;
    this.togglePdfSwitch();
    initializeSug();
    this.toggleInitArea();
  },

  //イースターエッグ
  yoyoky(ev) {
    if (ev.currentTarget.value.trim() == 'ヨヨキー') {
      //ヨヨキーモーダルを表示
      const yoyokyModalElement = document.getElementById('yoyokyModal');
      const yoyokyModal = new Modal(yoyokyModalElement);
      yoyokyModal.show();
    }
  },

  changeTitle() {
    if (this.isChangingTitle) return;
    this.isChangingTitle = true;

    const tmp = this.title;
    this.title = '(｀･ω･´)';
    setTimeout(() => {
      this.title = tmp;
      this.isChangingTitle = false;
    }, '3000');
  },

  changeCredit(ev) {
    if (this.isChangingCredit) return;
    this.isChangingCredit = true;

    const credit = ev.currentTarget;
    const tmp = credit.textContent;
    credit.textContent = '(´・ω・｀)ん？';
    setTimeout(() => {
      credit.textContent = tmp;
      this.isChangingCredit = false;
    }, '3000');
  }
}).mount();

//----------設定リセット関連---------------------------
const initBtn = document.getElementById('init');
const confirm = document.getElementById('confirm');

const toggleInitArea = () => {
  initBtn.classList.toggle('d-none');
  confirm.classList.toggle('d-none');
  confirm.scrollIntoView({
    behavior: 'smooth'
  });
};

//モーダルを閉じた時は設定リセットボタンを元に戻す
document.getElementById('modal').addEventListener('hidden.bs.modal', () => {
  initBtn.classList.remove('d-none');
  confirm.classList.add('d-none');
});
