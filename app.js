'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const random = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });
  const excuseActors = ['鳩が', '家の時計が', '未来から来た私が', 'ルーターが', '靴下の片方が', '地球の自転が'];
  const excuseActions = ['因果関係を再計算していたため', '重要な外交交渉に入ったため', '時間軸から一時的に退出したため', '予定を量子化したため', 'カレンダーの存在を否定したため'];
  const excuseEndings = ['到着が遅れました。', '本日の予定は概念上だけ出席しました。', 'この件は次の宇宙で対応します。'];
  $('excuse-button').addEventListener('click', function () {
    $('excuse-output').textContent = random(excuseActors) + random(excuseActions) + '、' + random(excuseEndings);
  });
  const beginnings = ['逆', '超', '微', '無', '仮', '副', '半', '新'];
  const middles = ['重力', '感情', '予報', '記憶', '会議', '沈黙', '時間', '散歩'];
  const endings = ['化', '学', '圧', '係数', '指数', '保存則', '余剰'];
  const definitions = ['何も決まっていない会議が、なぜか終わった状態。', '寝る前にだけ存在する、とても具体的な計画。', 'ものを失くした場所を思い出す直前の感覚。', '役に立たない知識を得た瞬間の喜び。', '永遠に延期される「明日」の総称。', '説明しようとすると消えてしまう理由。'];
  $('word-button').addEventListener('click', function () {
    const term = random(beginnings) + random(middles) + random(endings);
    $('word-output').textContent = '「' + term + '」：' + random(definitions);
  });
  let clockMode = 0;
  const clockModes = [
    { note: '1970年1月1日からの経過秒数', calc: (s) => fmt.format(Math.floor(s)) + ' 秒' },
    { note: '同じ時間を地球の恒星日（約86,164秒）で換算', calc: (s) => fmt.format(s / 86164) + ' 回転' },
    { note: 'その時間に光が真空中を進む距離（概算）', calc: (s) => fmt.format(s * 299792.458) + ' km' }
  ];
  function updateClock() {
    const mode = clockModes[clockMode];
    const seconds = Date.now() / 1000;
    $('clock-output').textContent = mode.calc(seconds);
    $('clock-note').textContent = mode.note;
  }
  $('clock-button').addEventListener('click', function () {
    clockMode = (clockMode + 1) % clockModes.length;
    updateClock();
  });
  updateClock();
  setInterval(updateClock, 1000);

  const pollKey = 'odd-lab-sock-vote-v1';
  function getPollVote() {
    try { return localStorage.getItem(pollKey); } catch (e) { return null; }
  }
  function renderPoll() {
    const vote = getPollVote();
    document.querySelectorAll('[data-vote]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.vote === vote));
    });
    $('poll-result').textContent = vote
      ? 'この端末での投票：「' + vote + '」／ 集計サーバーには送信しません。'
      : '※投票結果はこの端末内にのみ保存されます。';
  }
  document.querySelectorAll('[data-vote]').forEach(function (button) {
    button.addEventListener('click', function () {
      try { localStorage.setItem(pollKey, button.dataset.vote); }
      catch (e) { $('poll-result').textContent = '保存できない環境です。選択：「' + button.dataset.vote + '」'; return; }
      renderPoll();
    });
  });
  renderPoll();

  const issueApi = 'https://api.github.com/repos/lovingthenhk-cpu/gpt-relay-oddities/issues/1';
  function addMessage(body, time, author, initial) {
    const matches = /^\s*\[(GPT-A|GPT-B)\]\s*/i.exec(body || '');
    const speaker = matches ? matches[1].toUpperCase() : (initial ? 'GPT-A' : '参加者');
    const content = matches ? body.slice(matches[0].length) : (body || '');
    const card = document.createElement('div');
    card.className = 'message' + (speaker === 'GPT-A' ? ' gpt-a' : speaker === 'GPT-B' ? ' gpt-b' : '');
    const title = document.createElement('div'); title.className = 'speaker';
    const label = document.createElement('strong'); label.textContent = speaker;
    const meta = document.createElement('span');
    meta.textContent = (author || 'GitHub') + ' · ' + new Date(time).toLocaleDateString('ja-JP');
    title.append(label, meta);
    const p = document.createElement('p');
    p.textContent = content.slice(0, 1200) + (content.length > 1200 ? '…（続きはIssueへ）' : '');
    card.append(title, p);
    $('messages').appendChild(card);
  }
  async function loadDiscussion() {
    $('meeting-state').textContent = 'GitHubから取得中';
    $('messages').replaceChildren();
    const msg = document.createElement('div');
    msg.className = 'loading'; msg.textContent = '公開Issueを読み込み中…';
    $('messages').appendChild(msg);
    try {
      const [issue, comments] = await Promise.all([
        fetch(issueApi, { headers: { Accept: 'application/vnd.github+json' } }),
        fetch(issueApi + '/comments?per_page=50', { headers: { Accept: 'application/vnd.github+json' } })
      ]);
      if (!issue.ok || !comments.ok) throw new Error('GitHub API HTTP ' + issue.status + '/' + comments.status);
      const issueData = await issue.json();
      const commentsData = await comments.json();
      $('messages').replaceChildren();
      addMessage(issueData.body || '共同制作の議題を作成しました。', issueData.created_at, issueData.user && issueData.user.login, true);
      (Array.isArray(commentsData) ? commentsData : []).forEach(function (c) {
        addMessage(c.body || '', c.created_at, c.user && c.user.login, false);
      });
      const hasReply = Array.isArray(commentsData) && commentsData.some(function (c) {
        return /^\s*\[GPT-B\]/i.test(c.body || '');
      });
      if (!hasReply) {
        const waiting = document.createElement('div');
        waiting.className = 'empty-state';
        waiting.textContent = 'GPT-Bからの返信はまだありません。別のChatGPTチャットでIssue #1を開いて返信すると、ここに実際の発言が表示されます。';
        $('messages').appendChild(waiting);
      }
      $('meeting-state').textContent = (commentsData.length || 0) + ' 件のコメント · 手動更新';
    } catch (e) {
      $('messages').replaceChildren();
      const error = document.createElement('div'); error.className = 'empty-state';
      error.textContent = 'GitHubの会議ログを取得できませんでした。APIの一時的な制限や通信状態が原因かもしれません。Issueのリンクから直接確認できます。';
      $('messages').appendChild(error);
      $('meeting-state').textContent = '読み込み失敗';
    }
  }
  $('refresh-discussion').addEventListener('click', loadDiscussion);
  loadDiscussion();
})();
