'use strict';

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrapのスタイルシート側の機能
import 'bootstrap'; // BootstrapのJavaScript側の機能

const storage = localStorage;
const elementSuggestion = document.getElementById('elementSuggestion');

//-----------------ページ読み込み時--------------------
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

//項目サジェスト設定変更時
elementSuggestion.addEventListener('change', () => {
  setElementSug();
});

//項目名に既定値を入れる関数
const setDefaultEl = () => {
  const elementNames = document.getElementsByName('elementName');
  const defaults = ['中扉', '白', 'テキストの構成と活用法'];
  defaults.forEach((value, index) => {
    if (elementNames[index]) elementNames[index].value = value;
  });
};

//--------------------petite-vue----------------------------------
PetiteVue.createApp({
  //データプロパティ
  rows: 10,
  theme: '',
  whitePageSetting: '',
  pdfMessageSetting: true,
  title: '割付表ジェネレータ',

  //メソッド
  //読み込み時に実行
  init() {
    //白追加設定。ローカルストレージの値を見る。デフォルトは2n。
    if (storage.whitePageSetting == '4n') {
      this.whitePageSetting = '4n';
    } else {
      this.whitePageSetting = '2n';
    }
    //pdf文言設定。デフォルトはtrue。
    this.pdfMessageSetting = storage.pdfMessageSetting == 'off' ? false : true;

    //テーマ設定。デフォルトはライトモード。
    this.theme = storage.theme ? storage.theme : 'light';
    this.theme == 'light' ? this.setLightTheme() : this.setDarkTheme();
  },

  //行を追加
  addRow() {
    if (this.rows < 30) {
      this.rows += 1;
    } else {
      alert('(´・ω・｀)ちょっと多すぎるんじゃない……？');
    }
  },

  //連番の入力値修正
  only3Numbers(ev) {
    const el = ev.currentTarget;

    //全角数字を半角数字に変換、数字以外を削除
    el.value = el.value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/\D/g, '');

    //文字列が0のみであれば0を代入、そうでなければ先頭の0を削除し、さらに先頭の３文字を切り出す
    const zeroOnly = /^0+$/;
    if (zeroOnly.test(el.value)) {
      el.value = '0';
    } else {
      el.value = el.value.replace(/^0+/, '').slice(0, 3);
    }
  },

  //白追加設定をローカルストレージに保存
  set2n() {
    storage.whitePageSetting = '2n';
  },
  set4n() {
    storage.whitePageSetting = '4n';
  },

  //PDF文言設定をローカルストレージに保存
  togglePdfSwitch() {
    storage.pdfMessageSetting = this.pdfMessageSetting ? 'on' : 'off';
  },

  //テーマ設定
  setLightTheme() {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.body.classList.replace('bg-dark', 'bg-light');
    storage.theme = 'light';
  },

  setDarkTheme() {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.replace('bg-light', 'bg-dark');
    storage.theme = 'dark';
  },

  //フォームリセット
  resetForms() {
    document.querySelectorAll('.reset').forEach((form) => {
      form.value = '';
    });
    this.rows = 10; //項目の行数をリセット
    setDefaultEl();
  },

  //すべての設定を初期化ボタン押下時
  toggleInitArea() {
    toggleInitArea();
  },

  //設定リセット処理
  initAllSettings() {
    this.theme = 'light';
    this.setLightTheme();
    this.whitePageSetting = '2n';
    this.set2n();
    this.pdfMessageSetting = true;
    this.togglePdfSwitch();
    initializeSug();
    this.toggleInitArea();
  },

  //イースターエッグ
  yoyoky(ev) {
    if (ev.currentTarget.value == 'ヨヨキー') {
      alert('彼は呼んでも来ません。残念！');
    }
  },

  changeTitle() {
    const tmp = this.title;
    this.title = '(｀･ω･´)';
    setTimeout(() => {
      this.title = tmp;
    }, '3000');
  },

  changeCredit(ev) {
    const credit = ev.currentTarget;
    const tmp = credit.textContent;
    credit.textContent = '(´・ω・｀)ん？';
    setTimeout(() => {
      credit.textContent = tmp;
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
