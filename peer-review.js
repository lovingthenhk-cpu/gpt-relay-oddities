'use strict';
/* Deliberately fictional scores; deterministic and computed entirely on device. */
(function () {
  const reviewerComments = [
    '研究計画の壮大さに対して、実験室の広さが不足しています。',
    '先行研究は見つかりませんでしたが、探した範囲も明らかではありません。',
    '観察対象が全員うなずいている点は、統計学的に気になります。',
    '仮説が魅力的すぎるので、反証方法を一つ追加してください。',
    '結論を導く前に、まずテーマに名前を付けた功績を認めます。',
    '研究費にお菓子代が含まれている理由を説明してください。',
    '再現実験のために、同じ曜日をもう一度用意する必要があります。'
  ];
  const verdicts = {
    accepted: { label: '掲載（架空）', note: '研究の役立たなさが学会の期待に合致しました。' },
    revise: { label: '修正後に再審査', note: '結論は魅力的ですが、根拠の形式だけは整えてください。' },
    rejected: { label: '今回は見送り', note: '面白いテーマですが、審査員の理解が追いつきませんでした。' }
  };

  function normalizeTopic(input) {
    return Array.from(String(input == null ? '' : input).normalize('NFKC').replace(/\s+/gu, ' ').trim()).slice(0, 80).join('');
  }
  function hashTopic(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function reviewTopic(input) {
    const topic = normalizeTopic(input);
    if (!topic) return null;
    const seed = hashTopic(topic);
    const novelty = 20 + (seed % 81);
    const reproducibility = 15 + (Math.floor(seed / 83) % 86);
    const utility = 3 + (Math.floor(seed / 7019) % 78);
    const mean = (novelty + reproducibility + utility) / 3;
    const verdictKey = mean >= 66 ? 'accepted' : mean >= 42 ? 'revise' : 'rejected';
    const reviewer = reviewerComments[Math.floor(seed / 467) % reviewerComments.length];
    return { topic, novelty, reproducibility, utility, verdict: verdicts[verdictKey].label, note: verdicts[verdictKey].note, reviewer };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { normalizeTopic, hashTopic, reviewTopic };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('review-form');
  const input = document.getElementById('review-topic');
  const output = document.getElementById('review-result');
  if (!form || !input || !output) return;
  function addLine(parent, label, value) {
    const line = document.createElement('div');
    line.className = 'review-line';
    const heading = document.createElement('span'); heading.textContent = label;
    const data = document.createElement('strong'); data.textContent = value;
    line.append(heading, data);
    parent.appendChild(line);
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const result = reviewTopic(input.value);
    output.replaceChildren();
    if (!result) {
      output.textContent = '査読する研究テーマを入力してください。';
      input.focus();
      return;
    }
    const title = document.createElement('p');
    title.className = 'review-heading';
    title.textContent = '論文「' + result.topic + '」の査読結果';
    output.appendChild(title);
    addLine(output, '新規性', result.novelty + ' / 100');
    addLine(output, '再現性', result.reproducibility + ' / 100');
    addLine(output, '実用性', result.utility + ' / 100');
    addLine(output, '総合判定', result.verdict);
    const reason = document.createElement('p'); reason.textContent = result.note;
    const comment = document.createElement('p'); comment.textContent = '査読者のコメント：「' + result.reviewer + '」';
    output.append(reason, comment);
  });
})();
