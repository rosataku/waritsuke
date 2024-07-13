'use strict';

import { makeOnePagePdf } from './makeOnePagePdf';
import { makeTwoPagesPdf } from './makeTwoPagesPdf';
// Bootstrapのスタイルシート側の機能を読み込む
import 'bootstrap/dist/css/bootstrap.min.css';
// BootstrapのJavaScript側の機能を読み込む
import 'bootstrap';

const storage = localStorage;
const elementSuggestion = document.getElementById('elementSuggestion');

//-----------------ページ読み込み時--------------------
document.addEventListener('DOMContentLoaded', () => {
  //現在の年を取得
  const date = new Date();
  const currentYear = date.getFullYear();

  //フッターのクレジットを設定
  document.getElementById('credit').textContent = `© ${currentYear} k_hiyama`;

  //年度の選択項目を設定
  const year = document.getElementById('year');
  const opt1 = document.createElement('option');
  opt1.value = '';
  opt1.textContent = '----';
  year.appendChild(opt1);

  const opt2 = document.createElement('option');
  opt2.textContent = `${currentYear}年度`;
  opt2.selected = true;
  year.appendChild(opt2);

  const opt3 = document.createElement('option');
  opt3.textContent = `${currentYear + 1}年度`;
  year.appendChild(opt3);

  //項目に既定値を入れる
  setDefaultEl();

  //ローカルストレージにサジェスト設定がなければ初期化、あればそれを適用。
  if (storage.elementSuggestion == undefined) {
    initializeSug();
  } else {
    elementSuggestion.value = storage.elementSuggestion;
  }
  setElementSug();

  //テーマ設定。デフォルトはライトモード。

  if (storage.theme == 'dark') {
    document.querySelector('html').setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('bg-dark');
    document.getElementById('themeIcon').classList.add('bi-moon-fill');
  } else {
    document.querySelector('html').setAttribute('data-bs-theme', 'light');
    document.body.classList.add('bg-light');
    document.getElementById('themeIcon').classList.add('bi-sun-fill');
  }
});

//サジェスト設定を初期化する関数
const initializeSug = () => {
  elementSuggestion.value = ['中扉', '白', 'テキストの構成と活用法', '目次', 'ヨヨキー'].join('\n');
};

//サジェスト設定を適用する関数
const setElementSug = () => {
  const items = document.getElementById('elementSuggestion').value.split(/\n/).filter(Boolean);
  const itemList = document.getElementById('itemList');
  //既存の子要素（option）をすべて削除
  while (itemList.firstChild) {
    itemList.removeChild(itemList.firstChild);
  }
  //子要素としてoptionを新たに追加していく
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item;
    document.getElementById('itemList').appendChild(opt);
  }
};

//項目に既定値を入れる関数
const setDefaultEl = () => {
  document.getElementById('inputLists').firstElementChild.firstElementChild.firstElementChild.value = '中扉';
  document.getElementById('inputLists').firstElementChild.nextElementSibling.firstElementChild.firstElementChild.value =
    '白';
  document.getElementById(
    'inputLists'
  ).firstElementChild.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild.value =
    'テキストの構成と活用法';
};

//-----------------テーマトグルボタン押下時-------------------
document.getElementById('changeTheme').addEventListener('click', () => {
  if (document.querySelector('html').getAttribute('data-bs-theme') == 'light') {
    document.querySelector('html').setAttribute('data-bs-theme', 'dark');
    document.body.classList.replace('bg-light', 'bg-dark');
    document.getElementById('themeIcon').classList.replace('bi-sun-fill', 'bi-moon-fill');
    storage.theme = 'dark';
  } else {
    document.querySelector('html').setAttribute('data-bs-theme', 'light');
    document.body.classList.replace('bg-dark', 'bg-light');
    document.getElementById('themeIcon').classList.replace('bi-moon-fill', 'bi-sun-fill');
    storage.theme = 'light';
  }
});

//割付結果を格納する配列をグローバルスコープで宣言
let result = [];

//------------------割付表生成ボタン押下時--------------------
document.getElementById('generateButton').addEventListener('click', () => {
  //ボタンを無効に
  const geneBtn = document.getElementById('generateButton');
  geneBtn.toggleAttribute('disabled');

  //テキスト情報の値を取得
  const year = document.getElementById('year').value;
  const semester = document.getElementById('semester').value;
  const textNumber = document.getElementById('textNumber').value;
  const textName = year + semester + ' ' + document.getElementById('textName').value;

  //「項目」の入力内容を格納する配列を宣言
  const inputObjs = [];

  //項目設定の各行を配列に格納
  const inputLists = document.getElementsByClassName('inputList');

  //各行につき、オブジェクトを生成して配列inputObjsに格納
  for (const inputList of inputLists) {
    const obj = {
      elementName: inputList.firstElementChild.firstElementChild.value,
      startNumber: inputList.lastElementChild.firstElementChild.nextElementSibling.value,
      endNumber: inputList.lastElementChild.lastElementChild.value
    };
    inputObjs.push(obj);
  }

  //割付結果を格納する配列を初期化
  result = [];

  //配列inputObjsの各オブジェクトについて、項目名・連番の有無によって場合分けしながらresult[]にpushしていく。
  for (const obj of inputObjs) {
    if (!(obj.elementName == '' && obj.startNumber == '' && obj.endNumber == '')) {
      if (obj.startNumber == '' && obj.endNumber == '') {
        //項目名のみ入力されていた場合。
        result.push(`${obj.elementName}`);
      } else {
        //連番Fromまたは連番Toが空白だった場合に値を入れる。
        if (obj.startNumber == '') {
          obj.startNumber = 1;
        }
        if (obj.endNumber == '') {
          obj.endNumber = obj.startNumber;
        }

        //数値に変換
        const startN = Number(obj.startNumber);
        const endN = Number(obj.endNumber);

        //項目名に連番をつけてresult[]にpush。fromよりtoの方が小さい場合は降順に連番を振る。
        if (endN >= startN) {
          for (let i = startN; i <= endN; i += 1) {
            result.push(`${obj.elementName + i}`);
          }
        } else {
          for (let i = startN; i >= endN; i -= 1) {
            result.push(`${obj.elementName + i}`);
          }
        }
      }
    }
  }

  //pdf校了時の文言に使用するため、白追加前の総ページ数を保持しておく。
  const pdfMaxP = result.length;

  //「割付表設定」の値に応じて、白を追加。
  const radio = document.getElementsByName('whitePageSetting');
  let btnValue = '';
  for (const btn of radio) {
    if (btn.checked == true) {
      btnValue = btn.value;
    }
  }
  if (btnValue == '2n') {
    for (let i = 1; result.length % 2 != 0; i += 1) {
      result.push('白');
    }
  } else if (btnValue == '4n') {
    for (let i = 1; result.length % 4 != 0; i += 1) {
      result.push('白');
    }
  }

  //PDF校了用メッセージを作成
  const checkbox = document.getElementsByName('pdfMessageSetting')[0];
  let pdfMessage = '';
  if (checkbox.checked == true && pdfMaxP >= 3) {
    pdfMessage = [
      '・表紙と中扉は版下支給（同封）。',
      `・本文3頁（"${result[2]}") ～`,
      `　本文${pdfMaxP}頁（"${result[pdfMaxP - 1]}"）までは、`,
      '　PDFデータ支給（同封のCD）となります。'
    ].join('\n');
  }

  //PDF生成ライブラリに渡すオブジェクトを作成
  const pdfSource = { textNumber: textNumber, textName: textName, pdfMessage: pdfMessage, result: result };

  //PDF生成
  if (result.length <= 288) {
    makeOnePagePdf(pdfSource);
  } else if (result.length <= 576) {
    makeTwoPagesPdf(pdfSource);
  } else {
    //ページ数が多すぎる場合、生成せずアラートを出す。
    alert('ページ数が多すぎるため、割付表を生成できませんでした。（総ページ数の上限は576です。）');
  }

  //ボタンを有効に
  geneBtn.toggleAttribute('disabled');
});

//-----------------フォームリセットボタンクリック時----------------------
document.getElementById('resetForm').addEventListener('click', () => {
  const resetForms = document.querySelectorAll('.reset');
  resetForms.forEach(function (resetForm) {
    resetForm.value = '';
  });
  setDefaultEl();
});

//--------------------モーダル関連----------------------------------
const modal = document.getElementById('modal');

modal.addEventListener('show.bs.modal', () => {
  //設定ボタン押下時のサジェスト設定を一時保持しておく
  const temp = elementSuggestion.value;

  //キャンセルボタン押下時に、一時保持しておいた設定データを戻す。（＝変更内容を破棄）
  document.getElementById('cancel').addEventListener('click', () => {
    document.getElementById('elementSuggestion').value = temp;
  });
});
//保存ボタン押下時
document.getElementById('save').addEventListener('click', () => {
  //ローカルストレージにサジェスト設定を保存
  storage.elementSuggestion = document.getElementById('elementSuggestion').value;
  //サジェストリストに設定
  setElementSug();
});
//デフォルトに戻すボタン押下時
document.getElementById('default').addEventListener('click', () => {
  initializeSug();
});

//-------------------イースターエッグ-------------------------------
//項目名に「ヨヨキー」と入力したらアラートを出す。
const allElementName = document.querySelectorAll('.elementName');
allElementName.forEach(function (elementName) {
  elementName.addEventListener('change', function (e) {
    const inputValue = e.target.value;
    if (inputValue == 'ヨヨキー') {
      alert('彼は呼んでも来ません。残念！');
    }
  });
});
