import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
  setup() {
    const rows = ref(9);
    return {
      rows
    };
  },
  /* data: {
    rows: 9
  }, */

  methods: {
    addRow: function () {
      if (this.rows < 30) {
        this.rows += 1;
      } else {
        alert('行が多すぎます');
      }
    }
  }
}).mount('#inputLists');
