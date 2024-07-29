'use strict';

import { makeOnePagePdf } from './makeOnePagePdf';
import { makeTwoPagesPdf } from './makeTwoPagesPdf';

const geneBtn = document.getElementById('generateButton');
const geneBtnText = document.getElementById('geneBtnText');
const loadingText = document.getElementById('loadingText');

//割付表生成ボタンをトグルする関数
const toggleGeneBtn = () => {
  geneBtn.toggleAttribute('disabled');
  geneBtnText.classList.toggle('d-none');
  loadingText.classList.toggle('d-none');
};

//割付表生成ボタン押下時
geneBtn.addEventListener('click', () => {
  const geneWaritsuke = async () => {
    //テキスト情報の値を取得
    const year = document.getElementById('year').value;
    const semester = document.getElementById('semester').value;
    const textNumber = document.getElementById('textNumber').value;
    const textName = year + semester + ' ' + document.getElementById('textName').value;

    //「項目」の入力内容を格納する配列を宣言
    const inputObjs = [];

    //項目設定の各行を取得
    const inputLists = document.getElementsByClassName('inputList');

    //各行につき、オブジェクトを生成して配列inputObjsに格納
    for (const inputList of inputLists) {
      const obj = {
        elementName: inputList.querySelector('input[name="elementName"]').value,
        from: inputList.querySelector('input[name="from"]').value,
        to: inputList.querySelector('input[name="to"]').value
      };
      inputObjs.push(obj);
    }

    //割付結果を格納する配列
    const result = [];

    //配列inputObjsの各オブジェクトについて、連番を生成してresult[]にpushしていく。
    for (const inputObj of inputObjs) {
      const { elementName, from, to } = inputObj;

      //すべて空白の場合はループをスキップ
      if (elementName == '' && from == '' && to == '') continue;

      if (from == '' && to == '') {
        //項目名のみ入力されていた場合。
        result.push(`${elementName}`);
      } else {
        //連番FromまたはToが空白だった場合は値を入れる。
        const fromN = from == '' ? 1 : Number(from);
        const toN = to == '' ? fromN : Number(to);

        //連番を生成してresult[]にpush。fromよりtoの方が小さい場合は降順に連番を振る。
        const range =
          toN >= fromN
            ? [...Array(toN - fromN + 1).keys()].map((i) => fromN + i)
            : [...Array(fromN - toN + 1).keys()].map((i) => fromN - i);

        range.forEach((i) => result.push(`${elementName}${i}`));
      }
    }

    //pdf校了時の文言に使用するため、白追加前の総ページ数を保持しておく。
    const pdfMaxP = result.length;

    //「割付表設定」の値に応じて、白を追加。
    const radio = document.getElementsByName('whitePageSetting');
    let btnValue = '';
    for (const btn of radio) {
      if (btn.checked) {
        btnValue = btn.value;
      }
    }
    if (btnValue == '2n') {
      while (result.length % 2 != 0) result.push('白');
    } else if (btnValue == '4n') {
      while (result.length % 4 != 0) result.push('白');
    }

    //PDF校了用メッセージを作成
    const pdfMessageSetting = document.getElementsByName('pdfMessageSetting')[0].checked;
    const pdfMessage =
      pdfMessageSetting && pdfMaxP >= 3
        ? [
            '・表紙と中扉は版下支給（同封）。',
            `・本文3頁（"${result[2]}") ～`,
            `　本文${pdfMaxP}頁（"${result[pdfMaxP - 1]}"）までは、`,
            '　PDFデータ支給（同封のCD）となります。'
          ].join('\n')
        : '';

    //PDF生成ライブラリに渡すオブジェクトを作成
    const pdfSrc = { textNumber, textName, pdfMessage, result };

    //PDF生成
    if (result.length <= 288) {
      toggleGeneBtn();
      await makeOnePagePdf(pdfSrc);
      toggleGeneBtn();
    } else if (result.length <= 576) {
      toggleGeneBtn();
      await makeTwoPagesPdf(pdfSrc);
      toggleGeneBtn();
    } else {
      //ページ数が多すぎる場合、生成せずアラートを出す。
      alert('ページ数が多すぎるため、割付表を生成できませんでした。（総ページ数の上限は576です。）');
    }
  };

  geneWaritsuke();
});
