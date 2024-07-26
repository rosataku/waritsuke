'use strict';

import { makeOnePagePdf } from './makeOnePagePdf';
import { makeTwoPagesPdf } from './makeTwoPagesPdf';

//割付表生成ボタン押下時
document.getElementById('generateButton').addEventListener('click', () => {
  const geneBtn = document.getElementById('generateButton');
  const geneBtnText = document.getElementById('geneBtnText');
  const geneBtnTextTemp = geneBtnText.textContent;
  const rocketIcon = document.getElementById('rocketIcon');
  const spinner = document.getElementById('spinner');

  //割付表生成ボタンの文字列以外をトグルする関数
  const toggleGeneBtn = () => {
    geneBtn.toggleAttribute('disabled');
    rocketIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');
  };

  async function geneWaritsuke() {
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

    //割付結果を格納する配列
    const result = [];

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
      geneBtnText.textContent = ' 生成中……';
      toggleGeneBtn();
      await makeOnePagePdf(pdfSource);
      geneBtnText.textContent = geneBtnTextTemp;
      toggleGeneBtn();
    } else if (result.length <= 576) {
      geneBtnText.textContent = ' 生成中……';
      toggleGeneBtn();
      await makeTwoPagesPdf(pdfSource);
      geneBtnText.textContent = geneBtnTextTemp;
      toggleGeneBtn();
    } else {
      //ページ数が多すぎる場合、生成せずアラートを出す。
      alert('ページ数が多すぎるため、割付表を生成できませんでした。（総ページ数の上限は576です。）');
    }
  }

  geneWaritsuke();
});
