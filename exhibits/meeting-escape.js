'use strict';
(function () {
  const byId = (id) => document.getElementById(id);
  const moves = document.querySelectorAll('[data-move]');
  const defaultAgenda = '会議を減らす方法';
  let state = null;

  function statusText(s) {
    if (s.finished && s.won) return '脱出成功：議題「' + s.agenda + '」について、ついに決定しました。書類上は。';
    if (s.finished) return '会議は期限切れ。決まったのは「また考える」という方針だけでした。';
    return '審議中：「' + s.agenda + '」を決めなければ、この部屋から出られません。';
  }

  function render() {
    const s = state || {clarity: 0, debt: 3, minutes: 0, turn: 0, finished: false, won: false};
    byId('clarity-text').textContent = Math.min(s.clarity, 6) + ' / 6';
    byId('clarity-meter').setAttribute('aria-valuenow', String(Math.min(s.clarity, 6)));
    byId('clarity-bar').style.width = (Math.min(s.clarity, 6) / 6 * 100) + '%';
    byId('debt').replaceChildren(document.createTextNode(String(s.debt) + ' '), unit('件'));
    byId('minutes').replaceChildren(document.createTextNode(String(s.minutes) + ' '), unit('分'));
    byId('turn').replaceChildren(document.createTextNode(String(s.turn) + ' '), unit('回'));
    const active = Boolean(state && !state.finished);
    moves.forEach((button) => { button.disabled = !active; });
    byId('start').disabled = active;
    byId('agenda').disabled = active;
    byId('phase').textContent = !state ? '議題受付中' : s.finished ? (s.won ? '審議完了' : '審議打ち切り') : '第' + (s.turn + 1) + '回審議';
    const out = byId('outcome');
    out.className = 'outcome' + (state && s.finished ? (s.won ? ' success' : ' failure') : '');
    out.textContent = state ? statusText(s) : '議題を入力して「審議開始」を押してください。';
  }

  function unit(label) {
    const small = document.createElement('small');
    small.textContent = label;
    return small;
  }

  function log(line) {
    const list = byId('log');
    const item = document.createElement('li');
    item.textContent = line;
    list.appendChild(item);
  }

  function begin() {
    state = {
      agenda: byId('agenda').value.trim().slice(0, 60) || defaultAgenda,
      clarity: 0, debt: 3, minutes: 0, turn: 0,
      postponements: 0, finished: false, won: false
    };
    byId('log').replaceChildren();
    log('開会。議題：「' + state.agenda + '」。議長が全員に検討を求めた。');
    render();
  }

  function choose(action) {
    if (!state || state.finished) return;
    const s = state;
    s.turn += 1;
    let result;
    if (action === 'focus') {
      s.clarity += 2; s.debt = Math.max(0, s.debt - 1); s.minutes += 15;
      result = '論点をひとつに絞った。手続きが15分で進み、未解決事項が1件減った。';
    } else if (action === 'research') {
      s.clarity += 1; s.debt += 1; s.minutes += 35;
      result = '分厚い追加資料が届いた。理解は進んだが、新しい疑問も増えた。';
    } else if (action === 'reschedule') {
      s.clarity = Math.max(0, s.clarity - 1); s.debt += 1;
      s.minutes += 60; s.postponements += 1;
      result = '全員のカレンダーを調整した。次回の予定だけ決まった。';
    } else return;
    log('第' + s.turn + '回：' + result);
    if (s.clarity >= 6 && s.debt <= 1) {
      s.finished = true; s.won = true;
      log('議長は閉会を宣言した。「会議を終わらせる」という前例ができた。');
    } else if (s.turn >= 8 || s.postponements >= 3) {
      s.finished = true;
      log('会議が終わる前に会議室の予約時間が尽きた。議題は未決のまま。');
    }
    render();
  }

  byId('start').addEventListener('click', begin);
  byId('agenda').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !byId('start').disabled) begin();
  });
  moves.forEach((button) => button.addEventListener('click', () => choose(button.dataset.move)));
  byId('reset').addEventListener('click', () => {
    state = null;
    byId('agenda').value = '';
    byId('log').replaceChildren();
    log('まだ一度も会議が開かれていません。');
    render();
    byId('agenda').focus();
  });
  render();
})();
