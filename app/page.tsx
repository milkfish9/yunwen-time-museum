'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Dices,
  Grid2X2,
  Megaphone,
  Music2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ciPatterns,
  creationTopics,
  halls,
  type CiPattern,
} from '@/data/ci-workshop';
import {
  countWritingCharacters,
  firstIncompleteLine,
  flattenPattern,
  wheelTargetDegrees,
} from '@/lib/ci-workshop';
import { juejuPoems, rhymeRules, type JuejuPoem } from '@/data/jueju';
import {
  qualityCases,
  type QualityCase,
  type QualityDecision,
} from '@/data/jueju-quality';

type PageId =
  | 'origin'
  | 'create'
  | 'aliases'
  | 'types'
  | 'styles'
  | 'checkpoint'
  | 'jueju'
  | 'lushi'
  | 'duizhang'
  | 'jueju-quality';
type PublishedWork = {
  id: string;
  author: string;
  tune: string;
  topic: string;
  lines: string[];
  createdAt: number;
};
const PAGES: { id: PageId; label: string; title: string }[] = [
  { id: 'origin', label: '01 詞的由來', title: '詞，真的是到了宋朝才誕生嗎？' },
  { id: 'create', label: '02 填詞工作室', title: '先看懂詞牌，再創作一闋詞' },
  { id: 'aliases', label: '03 詞的別稱', title: '把別稱和由來連起來' },
  { id: 'types', label: '04 詞的類別', title: '用字數判斷小令、中調、長調' },
  { id: 'styles', label: '05 詞的風格', title: '婉約與豪放，各有什麼氣質？' },
  { id: 'checkpoint', label: '06 詞學闖關戰', title: '把學到的詞學知識帶走' },
];
const JINTISHI_PAGES: { id: PageId; label: string; title: string }[] = [
  { id: 'jueju', label: '01 絕句概念', title: '自己找出絕句的基本結構' },
  { id: 'lushi', label: '02 律詩概念', title: '觀察律詩的基本格律' },
  { id: 'duizhang', label: '03 律詩的對仗規則', title: '認識律詩對仗' },
  { id: 'jueju-quality', label: '04 近體詩品管局', title: '用規則檢驗近體詩' },
];

function randomIndex(length: number) {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function ShapeGlyph({ shape }: { shape: number[] }) {
  return (
    <div className="shape-glyph" aria-hidden="true">
      {shape.map((length, row) => (
        <span key={`${length}-${row}`}>
          {Array.from({ length }, (_, cell) => (
            <i key={cell} />
          ))}
        </span>
      ))}
    </div>
  );
}

function TimelineRail({ currentHall = '詞' }: { currentHall?: string }) {
  return (
    <aside
      className="era-rail"
      aria-label={`韻文時間軸，目前位於${currentHall}`}
    >
      <span className="rail-title">你在這裡</span>
      <div className="rail-line">
        {halls.map((hall) => (
          <div
            className={`rail-stop ${hall.name === currentHall ? 'current' : ''}`}
            key={hall.name}
          >
            <i />
            <span>
              <small>{hall.era}</small>
              <strong>{hall.name}</strong>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

const originStreams = [
  { id: 'yuefu', icon: '歌', title: '古樂府', note: '本來就有配樂歌唱的傳統' },
  { id: 'poetry', icon: '詩', title: '唐詩', note: '提供文字與句式的養分' },
  { id: 'foreign', icon: '樂', title: '胡樂', note: '帶來新的曲調與節拍' },
];

const yuMeiRenWorks = [
  {
    id: 'li-yu',
    author: '李煜',
    label: '春花秋月何時了',
    topic: '沒有訂題',
    lines: [
      '春花秋月何時了',
      '往事知多少',
      '小樓昨夜又東風',
      '故國不堪回首月明中',
      '雕闌玉砌應猶在',
      '只是朱顏改',
      '問君能有幾多愁',
      '恰似一江春水向東流',
    ],
  },
  {
    id: 'jiang-jie',
    author: '蔣捷',
    label: '少年聽雨歌樓上',
    topic: '聽雨',
    lines: [
      '少年聽雨歌樓上',
      '紅燭昏羅帳',
      '壯年聽雨客舟中',
      '江闊雲低斷雁叫西風',
      '而今聽雨僧廬下',
      '鬢已星星也',
      '悲歡離合總無情',
      '一任階前點滴到天明',
    ],
  },
  {
    id: 'su-shi',
    author: '蘇軾',
    label: '述懷',
    topic: '述懷',
    lines: [
      '歸心正似三春草',
      '試著萊衣小',
      '橘懷幾日向翁開',
      '懷祖已瞋文度不歸來',
      '禪心已斷人間愛',
      '只有平交在',
      '笑論瓜葛一枰同',
      '看取靈光新賦有家風',
    ],
  },
];

const staffSystems = [
  { start: 0, end: 12, split: 7 },
  { start: 12, end: 28, split: 7 },
  { start: 28, end: 40, split: 7 },
  { start: 40, end: 56, split: 7 },
];

const melodyPitches = [
  2, 4, 7, 9, 6, 3, 1, 5, 8, 10, 6, 2, 3, 7, 10, 8, 4, 1, 5, 9, 6, 2, 0, 4, 8,
  5, 3, 7, 1, 5, 9, 10, 6, 2, 4, 8, 5, 1, 6, 3, 8, 10, 7, 2, 0, 4, 9, 6, 3, 7,
  10, 8, 4, 1, 5, 2,
];

type NoteDuration = 'eighth' | 'quarter' | 'half';
const durationPattern: NoteDuration[] = [
  'quarter',
  'eighth',
  'eighth',
  'half',
  'quarter',
  'quarter',
  'eighth',
  'eighth',
];
const melodyDurations = Array.from(
  { length: melodyPitches.length },
  (_, index) => durationPattern[index % durationPattern.length],
);

function YuMeiRenScore({ work, onTopicFlash }: { work: (typeof yuMeiRenWorks)[number]; onTopicFlash?: () => void }) {
  const characters = work.lines.join('').split('');
  const lineEnds = new Set([6, 11, 18, 27, 34, 39, 46, 55]);
  const rhymeLabels = ['仄聲', '仄聲', '平聲', '平聲', '仄聲', '仄聲', '平聲', '平聲'];
  const previousWork = useRef(work.id);
  useEffect(() => {
    if (previousWork.current !== work.id) {
      onTopicFlash?.();
      previousWork.current = work.id;
    }
  }, [work.id, onTopicFlash]);
  return (
    <div className="score-scroll">
      <svg
        className="lyric-score"
        viewBox="0 0 1000 590"
        aria-label={`教學示意旋律，下方逐字填入${work.author}的虞美人`}
      >
        {staffSystems.map((system, systemIndex) => {
          const count = system.end - system.start;
          const baseY = 62 + systemIndex * 142;
          const step = 850 / (count - 1);
          const points = Array.from({ length: count }, (_, localIndex) => {
            const index = system.start + localIndex;
            return {
              index,
              x: 92 + localIndex * step,
              y: baseY + 40 - melodyPitches[index] * 5,
            };
          });
          return (
            <g key={system.start}>
              {Array.from({ length: 5 }, (_, line) => (
                <line
                  className="staff-line"
                  key={line}
                  x1="48"
                  y1={baseY + line * 10}
                  x2="970"
                  y2={baseY + line * 10}
                />
              ))}
              <text className="treble-clef" x="49" y={baseY + 36}>
                𝄞
              </text>
              <line
                className="measure-line"
                x1={92 + (system.split - 0.5) * step}
                x2={92 + (system.split - 0.5) * step}
                y1={baseY}
                y2={baseY + 40}
              />
              {points.map((point) => {
                const duration = melodyDurations[point.index];
                return (
                  <g key={point.index}>
                    {melodyPitches[point.index] === 10 && (
                      <line
                        className="ledger-line"
                        x1={point.x - 12}
                        x2={point.x + 12}
                        y1={baseY - 10}
                        y2={baseY - 10}
                      />
                    )}
                    <g
                      className={`score-note note-${duration}`}
                      style={{ animationDelay: `${point.index * 45}ms` }}
                    >
                      <ellipse
                        className="note-head"
                        cx={point.x}
                        cy={point.y}
                        rx="8"
                        ry="6"
                      />
                      <line
                        x1={point.x + 7}
                        x2={point.x + 7}
                        y1={point.y}
                        y2={point.y - 27}
                      />
                      {duration === 'eighth' && (
                        <path
                          className="note-flag"
                          d={`M ${point.x + 7} ${point.y - 27} Q ${point.x + 24} ${point.y - 19}, ${point.x + 17} ${point.y - 8}`}
                        />
                      )}
                    </g>
                    <rect
                      className={`lyric-cell ${lineEnds.has(point.index) ? 'rhyme-cell' : ''}`}
                      x={point.x - 16}
                      y={baseY + 57}
                      width="32"
                      height="34"
                      rx="4"
                    />
                    <text
                      key={`${work.id}-${point.index}`}
                      className="lyric-character"
                      x={point.x}
                      y={baseY + 81}
                      style={{ animationDelay: `${1100 + point.index * 55}ms` }}
                    >
                      {characters[point.index]}
                    </text>
                    {lineEnds.has(point.index) && (
                      <>
                        <text className="lyric-punctuation" x={point.x + 21} y={baseY + 81}>
                          {point.index === 55 ? '。' : '，'}
                        </text>
                        <text className="rhyme-label" x={point.x} y={baseY + 108}>
                          {rhymeLabels[[...lineEnds].indexOf(point.index)]}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OriginPage({ next }: { next: () => void }) {
  const [litSources, setLitSources] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const originsReady = litSources.length === originStreams.length;

  function advance(nextStep: number) {
    setStep(nextStep);
    window.setTimeout(() => {
      document
        .getElementById(`origin-act-${nextStep}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <section
      className="lesson origin-lesson origin-lesson-v2"
      aria-labelledby="origin-title"
    >
      <div className="origin-map-canvas">
        <header className="lesson-heading origin-heading">
          <p className="eyebrow">詞的誕生旅程</p>
          <h1 id="origin-title">詞，真的是到了宋朝才誕生嗎？</h1>
          <div className="origin-answer">
            <strong>答案藏在三幕旅程裡。</strong>
            <span>先找時間位置，再追查詞的誕生線索。</span>
          </div>
        </header>

        <section className="origin-act history-act" id="origin-act-1">
          <span className="act-number">第一幕</span>
          <h2>詞的時間定位</h2>
          <div className="ci-history-line" aria-label="詞的發展時間軸">
            <div>
              <i />
              <small>唐代</small>
              <strong>萌芽</strong>
            </div>
            <div>
              <i />
              <small>晚唐五代</small>
              <strong>成熟</strong>
            </div>
            <div className="flourished">
              <i />
              <small>兩宋</small>
              <strong>盛行</strong>
            </div>
          </div>
          {step === 1 && (
            <Button onClick={() => advance(2)}>
              詞是怎麼形成的？ <ArrowRight />
            </Button>
          )}
        </section>

        {step >= 2 && (
          <section className="origin-act source-act" id="origin-act-2">
            <span className="act-number">第二幕</span>
            <h2>三股力量，在隋唐相遇</h2>
            <p>請把三張來源圖卡都點亮。</p>
            <div className="origin-streams">
              {originStreams.map((source) => {
                const active = litSources.includes(source.id);
                return (
                  <button
                    className={active ? 'active' : ''}
                    key={source.id}
                    aria-pressed={active}
                    onClick={() =>
                      setLitSources((current) =>
                        current.includes(source.id)
                          ? current
                          : [...current, source.id],
                      )
                    }
                  >
                    <span>{source.icon}</span>
                    <strong>{source.title}</strong>
                    <small>{source.note}</small>
                  </button>
                );
              })}
            </div>
            <div className={`music-confluence ${originsReady ? 'ready' : ''}`}>
              <i />
              <i />
              <i />
              <div>
                <Music2 />
                <strong>隋唐新樂</strong>
                <span>新的旋律，需要新的歌詞</span>
              </div>
            </div>
            {originsReady && step === 2 && (
              <Button onClick={() => advance(3)}>
                看看填詞人怎麼做 <ArrowRight />
              </Button>
            )}
          </section>
        )}

        {step >= 3 && (
          <section className="origin-act comic-act" id="origin-act-3">
            <span className="act-number">第三幕</span>
            <h2>有了曲調，填詞人登場了</h2>
            <p>跟著箭頭讀完四格漫畫，看看歌詞如何裝進旋律。</p>
            <div
              className="ci-comic-grid"
              aria-label="詞人依照旋律填入歌詞的四格漫畫"
            >
              {[1, 2, 3, 4].map((panel) => (
                <figure key={panel}>
                  <span>{panel}</span>
                  <Image
                    src={`/ci-comic-${panel}.png`}
                    alt={`四格漫畫第 ${panel} 格`}
                    width={1450}
                    height={1086}
                    sizes="(max-width: 720px) 92vw, 42vw"
                  />
                  {panel < 4 && <i aria-hidden="true">➜</i>}
                </figure>
              ))}
            </div>
            <Button className="origin-next" onClick={next}>
              我懂了！可是，要怎麼填詞呢？ <ArrowRight />
            </Button>
          </section>
        )}
      </div>
    </section>
  );
}

function CapsuleMachine({
  phase,
  pattern,
  spin,
}: {
  phase: 'idle' | 'spinning' | 'revealed';
  pattern: CiPattern | null;
  spin: () => void;
}) {
  return (
    <section className="draw-panel gacha-panel">
      <div className={`gacha-machine ${phase}`} aria-hidden="true">
        <div className="gacha-topper">
          <Sparkles />
        </div>
        <div className="gacha-globe">
          {ciPatterns.map((item, index) => (
            <i
              key={item.id}
              style={{ '--capsule': index } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="gacha-neck" />
        <div className="gacha-body">
          <span className="gacha-knob">
            <RotateCcw />
          </span>
          <span className="gacha-mouth">
            <i />
          </span>
        </div>
        <span className="gacha-foot left" />
        <span className="gacha-foot right" />
        <div className="falling-capsule" />
      </div>
      <div>
        <span className="step-label">第一抽 · 詞牌模具</span>
        <h2>{pattern ? pattern.name : '扭出今天的詞牌'}</h2>
        <p>【詞牌】決定了你的作品的字數和格式。</p>
        <Button onClick={spin} disabled={phase === 'spinning'}>
          <Dices />{' '}
          {phase === 'spinning'
            ? '扭蛋滾動中…'
            : pattern
              ? '再扭一次'
              : '轉動扭蛋'}
        </Button>
      </div>
    </section>
  );
}

function ConceptQuiz({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const questions = [
    { prompt: '所以，你覺得「詞牌」可以決定什麼呢？', options: ['決定歌詞字數', '決定歌詞句數', '決定聲律（平仄的位置）', '決定歌詞內容'], correct: ['決定歌詞字數', '決定歌詞句數', '決定聲律（平仄的位置）'] },
    { prompt: '能決定歌詞內容的是什麼呢？', options: ['詞牌', '題目'], correct: ['題目'] },
  ];
  const complete = questions.every((question, index) => {
    const selected = answers[index] ?? [];
    return selected.length === question.correct.length && selected.every((item) => question.correct.includes(item));
  });
  return <div className="concept-quiz">{questions.map((question, index) => { const selected = answers[index] ?? []; const correct = selected.length === question.correct.length && selected.every((item) => question.correct.includes(item)); return <fieldset key={question.prompt}><legend>{index + 1}. {question.prompt}{index === 0 && <small>（可複選）</small>}</legend><div className="concept-options">{question.options.map((option) => <button type="button" key={option} className={selected.includes(option) ? 'selected' : ''} onClick={() => setAnswers((current) => { const previous = current[index] ?? []; const next = previous.includes(option) ? previous.filter((item) => item !== option) : [...previous, option]; return { ...current, [index]: next }; })}>{option}</button>)}</div>{selected.length > 0 && <small>{correct ? '答對了！' : '再想想看。'}</small>}</fieldset>; })}{complete && <Button onClick={onComplete}>答對了，開始今天的填詞活動 <ArrowRight /></Button>}</div>;
}

function TopicWheel({
  topic,
  spinning,
  turns,
  spin,
}: {
  topic: string | null;
  spinning: boolean;
  turns: number;
  spin: () => void;
}) {
  return (
    <section className="draw-panel wheel-panel">
      <div className="wheel-wrap" aria-hidden="true">
        <span className="wheel-pointer" />
        <div
          className="topic-wheel"
          style={{ transform: `rotate(${turns}deg)` }}
        >
          <span>遲到</span>
          <span>考砸</span>
          <span>出遊</span>
          <span>自由</span>
        </div>
        <CircleDot className="wheel-hub" />
      </div>
      <div>
        <span className="step-label">第二抽 · 創作題目</span>
        <h2>{topic ?? '轉出真正要寫的題目'}</h2>
        <p>轉盤要抽的是【題目】。</p>
        <Button onClick={spin} disabled={spinning}>
          <RotateCcw />{' '}
          {spinning ? '轉盤旋轉中…' : topic ? '再轉一次' : '轉動題目盤'}
        </Button>
      </div>
    </section>
  );
}

function WritingMold({
  pattern,
  topic,
  onPublished,
}: {
  pattern: CiPattern;
  topic: string;
  onPublished: () => void;
}) {
  const [lines, setLines] = useState<string[]>(() =>
    Array(flattenPattern(pattern).length).fill(''),
  );
  const [message, setMessage] = useState(
    '題目已貼好。現在把你的內容逐句填進模具。',
  );
  const [complete, setComplete] = useState(false);
  const [author, setAuthor] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  function change(index: number, value: string) {
    setLines((current) =>
      current.map((line, i) => (i === index ? value : line)),
    );
    setComplete(false);
  }

  async function publish() {
    if (!author.trim()) {
      setPublishMessage('請先填寫自己的名字。');
      return;
    }
    setPublishing(true);
    setPublishMessage('作品正在送往汴京城……');
    try {
      const result = await fetch('/api/works', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ author, tune: pattern.name, topic, lines }),
      });
      const data = (await result.json()) as { message?: string };
      if (!result.ok) throw new Error(data.message);
      setPublishMessage('張貼成功！全城的詞人都能在佈告欄看見這闋作品。');
      onPublished();
    } catch (error) {
      setPublishMessage(
        error instanceof Error && error.message
          ? error.message
          : '作品沒有送達，請再試一次。',
      );
    } finally {
      setPublishing(false);
    }
  }

  function inspect() {
    const mismatch = firstIncompleteLine(pattern, lines);
    if (mismatch) {
      setMessage(
        `第 ${mismatch.index + 1} 句需要 ${mismatch.expected} 字，目前是 ${mismatch.actual} 字。標點不計入字數。`,
      );
      setComplete(false);
      return;
    }
    setMessage('每一句都放進正確的格數了。這就是依詞牌格式「填」詞。');
    setComplete(true);
    try {
      localStorage.setItem(
        'yunwen-ci-draft-v2',
        JSON.stringify({ tune: pattern.name, topic, lines }),
      );
    } catch {
      setMessage('格式檢查通過；此瀏覽器無法保存草稿，請先保留目前頁面。');
    }
  }

  return (
    <section className="writing-desk" aria-labelledby="writing-title">
      <div className="work-title">
        <span className="tune-tag">詞牌・{pattern.name}</span>
        <span className="topic-sticker">題目・{topic}</span>
      </div>
      <div className="mold-intro">
        <div>
          <span className="step-label">第三步 · 自己填詞</span>
          <h2 id="writing-title">把你的創作歌詞寫進「{pattern.name}」的形狀</h2>
          <p>{pattern.guide}</p>
        </div>
        <a href={pattern.source} target="_blank" rel="noreferrer">
          查看代表作 ↗
        </a>
      </div>

      <div className="stanza-grid">
        {pattern.stanzas.map((stanza, stanzaIndex) => {
          const offset = pattern.stanzas
            .slice(0, stanzaIndex)
            .reduce((sum, part) => sum + part.length, 0);
          return (
            <fieldset key={stanzaIndex} className="stanza">
              <legend>
                {pattern.stanzas.length > 1
                  ? stanzaIndex === 0
                    ? '上闋（上片）'
                    : '下闋（下片）'
                  : '全闋'}
              </legend>
              {stanza.map((length, lineIndex) => {
                const index = offset + lineIndex;
                const count = countWritingCharacters(lines[index] ?? '');
                return (
                  <label className="writing-line" key={index}>
                    <span>第 {index + 1} 句</span>
                    <input
                      value={lines[index] ?? ''}
                      onChange={(event) => change(index, event.target.value)}
                      placeholder={`${length} 字`}
                      aria-invalid={count > 0 && count !== length}
                    />
                    <b
                      className={
                        count === length
                          ? 'matched'
                          : count > length
                            ? 'over'
                            : ''
                      }
                    >
                      {count} / {length}
                    </b>
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>
      <div
        className={`writing-feedback ${complete ? 'complete' : ''}`}
        aria-live="polite"
      >
        <p>{message}</p>
        <Button onClick={inspect}>
          <Check /> 檢查整副模具
        </Button>
      </div>
      {complete && (
        <div className="publish-booth">
          <div>
            <span className="step-label">第四步 · 寫上名字再張貼</span>
            <label htmlFor="poet-name">你的名字（必填）</label>
            <input
              id="poet-name"
              value={author}
              maxLength={12}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="請輸入自己的名字"
              autoComplete="name"
              required
            />
          </div>
          <Button onClick={publish} disabled={publishing}>
            <Send /> {publishing ? '送往汴京城中…' : '發佈到汴京城佈告欄'}
          </Button>
          {publishMessage && <p aria-live="polite">{publishMessage}</p>}
        </div>
      )}
    </section>
  );
}

function BianjingBoard({
  revision,
  adminPassword,
  onExitAdmin,
  onPasswordChanged,
}: {
  revision: number;
  adminPassword?: string;
  onExitAdmin?: () => void;
  onPasswordChanged?: (password: string) => void;
}) {
  const [works, setWorks] = useState<PublishedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);

  async function load() {
    setLoading(true);
    setMessage('');
    try {
      const result = await fetch('/api/works', { cache: 'no-store' });
      const data = (await result.json()) as {
        works?: PublishedWork[];
        message?: string;
      };
      if (!result.ok) throw new Error(data.message);
      setWorks(data.works ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : '佈告欄暫時無法開啟。',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/works', { cache: 'no-store' })
      .then(async (result) => {
        const data = (await result.json()) as {
          works?: PublishedWork[];
          message?: string;
        };
        if (!result.ok) throw new Error(data.message);
        if (active) {
          setWorks(data.works ?? []);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(
            error instanceof Error && error.message
              ? error.message
              : '佈告欄暫時無法開啟。',
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [revision]);

  async function deleteWork(id: string) {
    if (!adminPassword) return;
    setDeleting(true);
    setMessage('');
    try {
      const result = await fetch('/api/works/admin', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword }),
      });
      const data = (await result.json()) as { message?: string };
      if (!result.ok) throw new Error(data.message);
      setWorks((current) => current.filter((work) => work.id !== id));
      setPendingDelete(null);
      setMessage('作品已從汴京城佈告欄移除。');
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : '作品尚未刪除，請再試一次。',
      );
    } finally {
      setDeleting(false);
    }
  }

  async function changePassword(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminPassword || !onPasswordChanged) return;
    if (newPassword !== confirmPassword) {
      setPasswordMessage('兩次輸入的新密碼不一致。');
      return;
    }
    setSavingPassword(true);
    setPasswordMessage('');
    try {
      const result = await fetch('/api/works/admin', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: adminPassword, newPassword }),
      });
      const data = (await result.json()) as { message?: string };
      if (!result.ok) throw new Error(data.message);
      onPasswordChanged(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
      setMessage('管理密碼已更新；下次請使用新密碼登入。');
    } catch (error) {
      setPasswordMessage(
        error instanceof Error && error.message
          ? error.message
          : '密碼尚未更新，請再試一次。',
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <section className="city-board" aria-labelledby="city-board-title">
      <header>
        <div>
          <p className="eyebrow">全班共享作品區</p>
          <h2 id="city-board-title">
            <Megaphone /> 汴京城佈告欄
          </h2>
          <p>城裡新張貼的詞都在這裡。讀讀別人的詞牌如何裝進不同題目。</p>
        </div>
        <div className="board-actions">
          {adminPassword && (
            <button
              className={`admin-badge ${adminToolsOpen ? 'open' : ''}`}
              aria-expanded={adminToolsOpen}
              onClick={() => {
                setAdminToolsOpen((current) => !current);
                setChangingPassword(false);
                setPasswordMessage('');
              }}
            >
              <ShieldCheck /> 管理模式
            </button>
          )}
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw /> {loading ? '巡城中…' : '重新整理佈告欄'}
          </Button>
          {adminPassword && onExitAdmin && (
            <Button variant="ghost" onClick={onExitAdmin}>
              退出管理
            </Button>
          )}
        </div>
      </header>
      {adminPassword && adminToolsOpen && (
        <div className="admin-control-panel">
          <div>
            <strong>佈告欄管理工具</strong>
            <span>你可以逐篇刪除作品，或更新管理密碼。</span>
          </div>
          {onPasswordChanged && (
            <Button
              variant="outline"
              onClick={() => {
                setChangingPassword((current) => !current);
                setPasswordMessage('');
              }}
            >
              更改管理密碼
            </Button>
          )}
        </div>
      )}
      {adminToolsOpen &&
        changingPassword &&
        adminPassword &&
        onPasswordChanged && (
          <form className="password-change" onSubmit={changePassword}>
            <div>
              <strong>設定新的管理密碼</strong>
              <span>請輸入 8 至 64 個字元；儲存後舊密碼會立即失效。</span>
            </div>
            <label htmlFor="new-board-admin-password">新密碼</label>
            <input
              id="new-board-admin-password"
              type="password"
              value={newPassword}
              minLength={8}
              maxLength={64}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <label htmlFor="confirm-board-admin-password">再輸入一次</label>
            <input
              id="confirm-board-admin-password"
              type="password"
              value={confirmPassword}
              minLength={8}
              maxLength={64}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <div className="password-change-actions">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? '儲存中…' : '儲存新密碼'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMessage('');
                }}
              >
                取消
              </Button>
            </div>
            {passwordMessage && <output>{passwordMessage}</output>}
          </form>
        )}
      {message && <output className="board-message">{message}</output>}
      {!loading && !message && works.length === 0 && (
        <div className="empty-board">
          <Sparkles />
          <strong>城門剛開，等你張貼第一闋詞！</strong>
        </div>
      )}
      <div className="work-wall">
        {works.map((work) => (
          <article className="posted-work" key={work.id}>
            <div className="work-heading">
              <span>
                <small>詞牌名</small>
                <strong>{work.tune}</strong>
              </span>
              <span>
                <small>題目</small>
                <strong>{work.topic}</strong>
              </span>
              <span>
                <small>作者名字</small>
                <strong>{work.author}</strong>
              </span>
            </div>
            <div className="poem-lines">
              {work.lines.map((line, index) => (
                <span key={`${work.id}-${index}`}>{line}</span>
              ))}
            </div>
            <time dateTime={new Date(work.createdAt).toISOString()}>
              {new Intl.DateTimeFormat('zh-TW', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(work.createdAt)}{' '}
              張貼
            </time>
            {adminPassword && adminToolsOpen && (
              <div className="delete-control">
                {pendingDelete === work.id ? (
                  <>
                    <span>確定刪除這一篇？</span>
                    <Button
                      variant="destructive"
                      onClick={() => void deleteWork(work.id)}
                      disabled={deleting}
                    >
                      <Trash2 /> {deleting ? '刪除中…' : '確認刪除'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setPendingDelete(null)}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setPendingDelete(work.id)}
                  >
                    <Trash2 /> 刪除此作
                  </Button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function BoardAdminAccess({
  onAuthenticated,
}: {
  onAuthenticated: (password: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  async function authenticate(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setMessage('');
    try {
      const result = await fetch('/api/works/admin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await result.json()) as { message?: string };
      if (!result.ok) throw new Error(data.message);
      onAuthenticated(password);
      setPassword('');
      setOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : '無法進入管理模式。',
      );
    } finally {
      setChecking(false);
    }
  }

  if (!open) {
    return (
      <button className="admin-entry" onClick={() => setOpen(true)}>
        <ShieldCheck /> 管理汴京城佈告欄
      </button>
    );
  }

  return (
    <form className="admin-login" onSubmit={authenticate}>
      <label htmlFor="board-admin-password">管理密碼</label>
      <input
        id="board-admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />
      <Button type="submit" disabled={checking}>
        <ShieldCheck /> {checking ? '驗證中…' : '進入管理'}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        取消
      </Button>
      {message && <output>{message}</output>}
    </form>
  );
}

const aliasPairs = [
  { alias: '曲子詞', origin: '依照曲譜填入歌詞。' },
  { alias: '樂府', origin: '為了配合音樂歌唱而作。' },
  { alias: '詩餘', origin: '從「詩」演變而來。' },
  { alias: '長短句', origin: '句子大多長短不齊。' },
];

function AliasesPage({ next }: { next: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<{
    alias: string;
    x: number;
    y: number;
  } | null>(null);
  const dragMoved = useRef(false);

  function pair(origin: string, alias = selected) {
    if (!alias) return;
    setMatches((current) => ({ ...current, [origin]: alias }));
    setSelected(null);
  }

  const correct = aliasPairs.filter(
    (item) => matches[item.origin] === item.alias,
  ).length;

  return (
    <section className="lesson knowledge-page" aria-labelledby="aliases-title">
      <header className="lesson-heading compact-heading">
        <p className="eyebrow">第三分頁 · 拖曳配對</p>
        <h1 id="aliases-title">詞的別稱，藏著它的身世</h1>
        <p>把左邊的別稱拖到正確由來；也可以先點別稱，再點右邊說明。</p>
      </header>
      <div className="matching-board">
        <div className="matching-bank" aria-label="詞的別稱">
          {aliasPairs.map((item) => (
            <button
              key={item.alias}
              type="button"
              className={selected === item.alias ? 'selected' : ''}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                dragMoved.current = false;
                setSelected(item.alias);
                setDragging({
                  alias: item.alias,
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId))
                  return;
                dragMoved.current = true;
                setDragging({
                  alias: item.alias,
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
              onPointerUp={(event) => {
                if (dragMoved.current) {
                  const target = document
                    .elementFromPoint(event.clientX, event.clientY)
                    ?.closest<HTMLElement>('[data-alias-origin]');
                  const origin = target?.dataset.aliasOrigin;
                  if (origin) pair(origin, item.alias);
                }
                setDragging(null);
              }}
              onPointerCancel={() => setDragging(null)}
              onClick={() => {
                if (dragMoved.current) {
                  dragMoved.current = false;
                  return;
                }
                setSelected(item.alias);
              }}
            >
              {item.alias}
            </button>
          ))}
        </div>
        <div className="matching-targets">
          {[...aliasPairs].reverse().map((item) => {
            const answer = matches[item.origin];
            const right = answer === item.alias;
            return (
              <button
                key={item.origin}
                type="button"
                data-alias-origin={item.origin}
                className={answer ? (right ? 'correct' : 'wrong') : ''}
                onClick={() => pair(item.origin)}
              >
                <span>{answer ?? '拖到這裡'}</span>
                <strong>{item.origin}</strong>
                {answer && <small>{right ? '配對正確' : '再想想看'}</small>}
              </button>
            );
          })}
        </div>
      </div>
      {dragging && (
        <div
          className="alias-drag-ghost"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden="true"
        >
          {dragging.alias}
        </div>
      )}
      <div className="knowledge-feedback" aria-live="polite">
        <strong>
          {correct === 4 ? '四組全對！' : `目前答對 ${correct}／4 組`}
        </strong>
        <Button variant="outline" onClick={() => setMatches({})}>
          <RotateCcw /> 重新配對
        </Button>
      </div>
      {correct === aliasPairs.length && (
        <Button className="page-advance" onClick={next}>
          下一站：詞的類別 <ArrowRight />
        </Button>
      )}
    </section>
  );
}

type CiCategory = '小令' | '中調' | '長調';
const categoryWorks = [
  {
    id: 'rumengling',
    tune: '如夢令',
    author: '李清照',
    lines: [
      '常記溪亭日暮，沉醉不知歸路。',
      '興盡晚回舟，誤入藕花深處。',
      '爭渡，爭渡，驚起一灘鷗鷺。',
    ],
  },
  {
    id: 'yumeiren',
    tune: '虞美人',
    author: '李煜',
    lines: yuMeiRenWorks[0].lines,
  },
  {
    id: 'nanxiangzi',
    tune: '南鄉子',
    author: '辛棄疾',
    lines: [
      '何處望神州？滿眼風光北固樓。千古興亡多少事？悠悠，不盡長江滾滾流。',
      '年少萬兜鍪，坐斷東南戰未休。天下英雄誰敵手？曹劉。生子當如孫仲謀。',
    ],
  },
  {
    id: 'dielianhua',
    tune: '蝶戀花',
    author: '柳永',
    lines: [
      '佇倚危樓風細細，望極春愁，黯黯生天際。草色煙光殘照裡，無言誰會憑闌意。',
      '擬把疏狂圖一醉，對酒當歌，強樂還無味。衣帶漸寬終不悔，為伊消得人憔悴。',
    ],
  },
  {
    id: 'shuidiaogetou',
    tune: '水調歌頭',
    author: '蘇軾',
    lines: [
      '明月幾時有？把酒問青天。不知天上宮闕，今夕是何年。我欲乘風歸去，又恐瓊樓玉宇，高處不勝寒。起舞弄清影，何似在人間。',
      '轉朱閣，低綺戶，照無眠。不應有恨，何事長向別時圓？人有悲歡離合，月有陰晴圓缺，此事古難全。但願人長久，千里共嬋娟。',
    ],
  },
  {
    id: 'niannujiao',
    tune: '念奴嬌',
    author: '蘇軾',
    lines: [
      '大江東去，浪淘盡，千古風流人物。故壘西邊，人道是，三國周郎赤壁。亂石穿空，驚濤拍岸，捲起千堆雪。江山如畫，一時多少豪傑。',
      '遙想公瑾當年，小喬初嫁了，雄姿英發。羽扇綸巾，談笑間，檣櫓灰飛煙滅。故國神遊，多情應笑我，早生華髮。人生如夢，一尊還酹江月。',
    ],
  },
];

function categoryFor(count: number): CiCategory {
  if (count <= 58) return '小令';
  if (count <= 90) return '中調';
  return '長調';
}

function writingCharacters(text: string) {
  return Array.from(text).filter((character) => /[\p{Script=Han}A-Za-z0-9]/u.test(character));
}

function TypesPage({ next }: { next: () => void }) {
  const [openWork, setOpenWork] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, CiCategory>>({});
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [orderedWorks] = useState(() => {
    const works = [...categoryWorks];
    for (let index = works.length - 1; index > 0; index -= 1) {
      const swap = randomIndex(index + 1);
      [works[index], works[swap]] = [works[swap], works[index]];
    }
    return works;
  });
  const correctAnswers = categoryWorks.filter((work) => {
    const count = writingCharacters(work.lines.join('')).length;
    return answers[work.id] === categoryFor(count);
  }).length;

  return (
    <section className="lesson knowledge-page" aria-labelledby="types-title">
      <header className="lesson-heading compact-heading">
        <p className="eyebrow">第四分頁 · 字數分類尺</p>
        <h1 id="types-title">一闋詞有幾個字，決定它的類別</h1>
        <p>先記住上方的字數範圍，再逐闋詞拉動字數尺，自己判斷它是哪一類。</p>
      </header>
      <div className="category-ruler">
        <div className="category-bands">
          <span>
            小令
            <br />
            58 字以內
          </span>
          <span>
            中調
            <br />
            59～90 字
          </span>
          <span>
            長調
            <br />
            91 字以上
          </span>
        </div>
      </div>
      <div className="work-classifier">
        {orderedWorks.map((work) => {
          const characters = writingCharacters(work.lines.join(''));
          const count = characters.length;
          const currentReveal = revealed[work.id] ?? 0;
          const answer = answers[work.id];
          const right = answer === categoryFor(count);
          return (
            <article
              key={work.id}
              className={openWork === work.id ? 'open' : ''}
            >
              <button
                className="work-card-title"
                onClick={() =>
                  setOpenWork(openWork === work.id ? null : work.id)
                }
              >
                <span>{work.author}</span>
                <strong>〈{work.tune}〉</strong>
                <small>點開讀全文，再拉尺探索字數</small>
              </button>
              {openWork === work.id && (
                <div className="work-fulltext">
                  {work.lines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
              <div className="category-exploration">
                <div className="character-reveal-stream" aria-label={`${work.tune}逐字亮起`}>
                  {characters.map((character, index) => (
                    <span className={index < currentReveal ? 'revealed' : ''} key={`${work.id}-${index}`}>
                      {character}
                    </span>
                  ))}
                </div>
                <input
                  className="work-count-slider"
                  aria-label={`探索〈${work.tune}〉字數`}
                  type="range"
                  min="0"
                  max={characters.length}
                  value={currentReveal}
                  onChange={(event) =>
                    setRevealed((current) => ({ ...current, [work.id]: Number(event.target.value) }))
                  }
                />
                <output className="count-exploration-output">
                  {currentReveal === characters.length
                    ? `${count} 字`
                    : currentReveal > 0
                      ? `已亮起 ${currentReveal} 字`
                      : '拉動尺，讓字一個個亮起'}
                </output>
              </div>
              <div
                className="category-choices"
                aria-label={`判斷${work.tune}的類別`}
              >
                {(['小令', '中調', '長調'] as CiCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    disabled={currentReveal !== characters.length}
                    className={
                      answer === category ? (right ? 'correct' : 'wrong') : ''
                    }
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [work.id]: category,
                      }))
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
              {answer && (
                <small className={right ? 'answer-right' : 'answer-wrong'}>
                  {right ? '答對了' : `再看看字數界線`}
                </small>
              )}
            </article>
          );
        })}
      </div>
      {correctAnswers === categoryWorks.length && (
        <Button className="page-advance" onClick={next}>
          下一站：詞的風格 <ArrowRight />
        </Button>
      )}
    </section>
  );
}

const stylePractice = [
  {
    title: '蘇軾〈江城子〉',
    excerpt: '會挽雕弓如滿月，西北望，射天狼。',
    answer: '豪放派',
  },
  {
    title: '柳永〈雨霖鈴〉',
    excerpt: '今宵酒醒何處？楊柳岸曉風殘月。',
    answer: '婉約派',
  },
  {
    title: '李清照〈醉花陰〉',
    excerpt: '莫道不銷魂，簾捲西風，人比黃花瘦。',
    answer: '婉約派',
  },
  {
    title: '辛棄疾〈破陣子〉',
    excerpt: '了卻君王天下事，贏得生前身後名。',
    answer: '豪放派',
  },
] as const;

function StylesPage({ next }: { next: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const correctAnswers = stylePractice.filter(
    (item) => answers[item.title] === item.answer,
  ).length;
  return (
    <section className="lesson knowledge-page" aria-labelledby="styles-title">
      <header className="lesson-heading compact-heading">
        <p className="eyebrow">第五分頁 · 讀語氣辨風格</p>
        <h1 id="styles-title">詞壇以婉約為主，也開出了豪放一路</h1>
        <p>先比較兩派代表作品，再替下面四段詞句找到風格。</p>
      </header>
      <div className="style-showcase">
        <article className="graceful">
          <span>主要風格</span>
          <h2>婉約派</h2>
          <p className="poets">柳永・李清照・秦觀・周邦彥</p>
          <h3>李清照〈聲聲慢〉</h3>
          <p>尋尋覓覓，冷冷清清，淒淒慘慘戚戚。乍暖還寒時候，最難將息。</p>
          <strong className="style-note">細膩含蓄，善寫離愁與生活情思</strong>
        </article>
        <article className="bold">
          <span>另一重要風格</span>
          <h2>豪放派</h2>
          <p className="poets">蘇軾・辛棄疾</p>
          <h3>蘇軾〈念奴嬌〉</h3>
          <p>
            大江東去，浪淘盡，千古風流人物。亂石穿空，驚濤拍岸，捲起千堆雪。
          </p>
          <strong className="style-note">氣象開闊，常寫歷史、志向與家國</strong>
        </article>
      </div>
      <div className="style-practice">
        {stylePractice.map((item) => {
          const answer = answers[item.title];
          return (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <div>
                {['婉約派', '豪放派'].map((style) => (
                  <button
                    key={style}
                    className={
                      answer === style
                        ? style === item.answer
                          ? 'correct'
                          : 'wrong'
                        : ''
                    }
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [item.title]: style,
                      }))
                    }
                  >
                    {style}
                  </button>
                ))}
              </div>
              {answer && (
                <small>
                  {answer === item.answer
                    ? '判斷正確！'
                    : '再讀一次語氣與景象。'}
                </small>
              )}
            </article>
          );
        })}
      </div>
      {correctAnswers === stylePractice.length && (
        <Button className="page-advance" onClick={next}>
          下一站：詞學闖關戰 <ArrowRight />
        </Button>
      )}
    </section>
  );
}

function CheckpointPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordsChecked, setKeywordsChecked] = useState(false);
  const [certificate, setCertificate] = useState(false);
  const keywordGroups = [
    { label: '時代', options: ['秦代', '漢代', '宋代', '元代'] },
    {
      label: '人物',
      options: ['蘇軾', '李白', '李煜', '李清照', '辛棄疾', '蘇秦'],
    },
    {
      label: '別稱',
      options: [
        '詩餘',
        '詞餘',
        '曲子詞',
        '歌詞',
        '長短句',
        '長短腳',
        '樂府',
        '官府詞',
      ],
    },
  ];
  const correctKeywords = [
    '宋代',
    '蘇軾',
    '李煜',
    '李清照',
    '辛棄疾',
    '詩餘',
    '曲子詞',
    '長短句',
    '樂府',
  ];
  const keywordCorrect =
    keywords.length === correctKeywords.length &&
    correctKeywords.every((keyword) => keywords.includes(keyword));
  const score =
    (keywordCorrect ? 1 : 0) +
    (answers.content === '題目' ? 1 : 0) +
    (answers.format === '詞牌' ? 1 : 0) +
    (answers.category === '中調' ? 1 : 0) +
    (answers.graceful === '婉約派' && answers.bold === '豪放派' ? 1 : 0);

  function choose(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function toggleKeyword(keyword: string) {
    setKeywordsChecked(false);
    setKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  }

  return (
    <section
      className="lesson knowledge-page checkpoint-page"
      aria-labelledby="checkpoint-title"
    >
      <header className="lesson-heading compact-heading">
        <p className="eyebrow">第六分頁 · 階段評量</p>
        <h1 id="checkpoint-title">詞學闖關戰</h1>
        <p>完成五道任務，把詞的時代、人物、規則、類別與風格串起來。</p>
      </header>
      <div className="checkpoint-score">
        <strong>{score}／5</strong>
        <span>
          {score === 5 ? '全部通關！' : '每答一題，通關印章就會亮起。'}
        </span>
      </div>
      <div className="quiz-stack">
        <article className="quiz-card keyword-battle">
          <span>第一關・點出所有關鍵字</span>
          <h2>哪些時代、人物與別稱和「詞」有關？</h2>
          {keywordGroups.map((group) => (
            <fieldset key={group.label}>
              <legend>{group.label}</legend>
              <div>
                {group.options.map((keyword) => {
                  const selected = keywords.includes(keyword);
                  const shouldSelect = correctKeywords.includes(keyword);
                  const checkedClass = keywordsChecked
                    ? selected
                      ? shouldSelect
                        ? 'correct'
                        : 'wrong'
                      : shouldSelect
                        ? 'missing'
                        : ''
                    : '';
                  return (
                    <button
                      key={keyword}
                      className={`${selected ? 'selected' : ''} ${checkedClass}`}
                      onClick={() => toggleKeyword(keyword)}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <Button variant="outline" onClick={() => setKeywordsChecked(true)}>
            <Check /> 檢查關鍵字
          </Button>
          {keywordsChecked && (
            <small>
              {keywordCorrect
                ? '全部找到了！'
                : '綠色正確、紅色誤選；虛線框是漏掉的關鍵字。'}
            </small>
          )}
        </article>

        <article className="quiz-card">
          <span>第二關・詞牌還是題目？</span>
          <h2>跟一闋詞所寫的內容有關係的是哪一個？</h2>
          <div>
            {['詞牌', '題目'].map((option) => (
              <button
                key={option}
                className={
                  answers.content === option
                    ? option === '題目'
                      ? 'correct'
                      : 'wrong'
                    : ''
                }
                onClick={() => choose('content', option)}
              >
                {option}
              </button>
            ))}
          </div>
          {answers.content && (
            <small>
              {answers.content === '題目'
                ? '答對了！題目說明這闋詞在寫什麼。'
                : '詞牌通常不等於內容，再想想。'}
            </small>
          )}
        </article>

        <article className="quiz-card">
          <span>第三關・詞牌還是題目？</span>
          <h2>哪一個決定了一闋詞的句數、字數與格式？</h2>
          <div>
            {['詞牌', '題目'].map((option) => (
              <button
                key={option}
                className={
                  answers.format === option
                    ? option === '詞牌'
                      ? 'correct'
                      : 'wrong'
                    : ''
                }
                onClick={() => choose('format', option)}
              >
                {option}
              </button>
            ))}
          </div>
          {answers.format && (
            <small>
              {answers.format === '詞牌'
                ? '答對了！詞牌就是填詞模具。'
                : '題目只告訴我們內容。'}
            </small>
          )}
        </article>

        <article className="quiz-card unseen-work">
          <span>第四關・自己數字數</span>
          <h2>辛棄疾〈青玉案・元夕〉是小令、中調還是長調？</h2>
          <div className="assessment-poem">
            <p>
              東風夜放花千樹。更吹落、星如雨。寶馬雕車香滿路。鳳簫聲動，玉壺光轉，一夜魚龍舞。
            </p>
            <p>
              蛾兒雪柳黃金縷。笑語盈盈暗香去。眾裡尋他千百度。驀然回首，那人卻在，燈火闌珊處。
            </p>
          </div>
          <p className="count-yourself">這一關不提示字數，請自己數一數。</p>
          <div>
            {(['小令', '中調', '長調'] as CiCategory[]).map((option) => (
              <button
                key={option}
                className={
                  answers.category === option
                    ? option === '中調'
                      ? 'correct'
                      : 'wrong'
                    : ''
                }
                onClick={() => choose('category', option)}
              >
                {option}
              </button>
            ))}
          </div>
          {answers.category && (
            <small>
              {answers.category === '中調'
                ? '答對了！'
                : '請忽略標點，再逐字數一次。'}
            </small>
          )}
        </article>

        <article className="quiz-card style-duel">
          <span>第五關・婉約與豪放對決</span>
          <h2>判斷兩闋新作品各是哪一種風格。</h2>
          <div className="duel-grid">
            <section>
              <h3>甲・秦觀〈鵲橋仙〉</h3>
              <p>
                纖雲弄巧，飛星傳恨，銀漢迢迢暗度。金風玉露一相逢，便勝卻人間無數。
              </p>
              <p>
                柔情似水，佳期如夢，忍顧鵲橋歸路。兩情若是久長時，又豈在朝朝暮暮。
              </p>
              <div>
                {['婉約派', '豪放派'].map((option) => (
                  <button
                    key={option}
                    className={
                      answers.graceful === option
                        ? option === '婉約派'
                          ? 'correct'
                          : 'wrong'
                        : ''
                    }
                    onClick={() => choose('graceful', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3>乙・蘇軾〈定風波〉</h3>
              <p>
                莫聽穿林打葉聲，何妨吟嘯且徐行。竹杖芒鞋輕勝馬，誰怕？一蓑煙雨任平生。
              </p>
              <p>
                料峭春風吹酒醒，微冷，山頭斜照卻相迎。回首向來蕭瑟處，歸去，也無風雨也無晴。
              </p>
              <div>
                {['婉約派', '豪放派'].map((option) => (
                  <button
                    key={option}
                    className={
                      answers.bold === option
                        ? option === '豪放派'
                          ? 'correct'
                          : 'wrong'
                        : ''
                    }
                    onClick={() => choose('bold', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>
          </div>
          {answers.graceful && answers.bold && (
            <small>
              {answers.graceful === '婉約派' && answers.bold === '豪放派'
                ? '兩闋都判斷正確！'
                : '比較情感表達與整體氣勢，再試一次。'}
            </small>
          )}
        </article>
      </div>
      <div className="checkpoint-finish">
        <Button
          disabled={score !== 5}
          onClick={() => {
            setCertificate(true);
            window.setTimeout(
              () =>
                document
                  .getElementById('ci-certificate')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
              50,
            );
          }}
        >
          <Sparkles />
          {score === 5 ? '完成闖關，領取結業證書！' : '五關全對才能領取證書'}
        </Button>
      </div>
      {certificate && score === 5 && (
        <section
          className="ci-certificate"
          id="ci-certificate"
          aria-label="詞館虛擬結業證書"
        >
          <div className="certificate-seal">詞</div>
          <p>韻文時空館・詞館</p>
          <h2>結業證書</h2>
          <span>恭喜你完成「詞學闖關戰」</span>
          <strong>已能辨識詞的由來、規則、類別與風格</strong>
          <div className="certificate-signature">
            <span>詞學小達人・認證通過</span>
          </div>
          <small className="certificate-credit">
            發想設計：蘇牧盈老師｜Codex 協助建置
          </small>
        </section>
      )}
    </section>
  );
}

function CreatePage({ onBoardPublished, onNext }: { onBoardPublished?: () => void; onNext?: () => void }) {
  const [prepStep, setPrepStep] = useState(1);
  const [workId, setWorkId] = useState(yuMeiRenWorks[0].id);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [pattern, setPattern] = useState<CiPattern | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelTurns, setWheelTurns] = useState(0);
  const [topicFlash, setTopicFlash] = useState(false);
  const [published, setPublished] = useState(false);
  const timers = useRef<number[]>([]);
  const selectedWork =
    yuMeiRenWorks.find((work) => work.id === workId) ?? yuMeiRenWorks[0];

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  function advancePrep(nextStep: number) {
    setPrepStep(nextStep);
    window.setTimeout(() => {
      document
        .getElementById(`create-prep-${nextStep}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function spinCapsule() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    setPattern(null);
    setTopic(null);
    setPhase('spinning');
    timers.current = [
      window.setTimeout(() => {
        setPattern(ciPatterns[randomIndex(ciPatterns.length)]);
        setPhase('revealed');
      }, 1150),
    ];
  }

  function spinTopic() {
    setWheelSpinning(true);
    setTopic(null);
    const index = randomIndex(creationTopics.length);
    setWheelTurns((turns) => wheelTargetDegrees(turns, index));
    timers.current.push(
      window.setTimeout(() => {
        setTopic(creationTopics[index]);
        setWheelSpinning(false);
      }, 1200),
    );
  }

  return (
    <section className="lesson create-lesson" aria-labelledby="create-title">
      <header className="lesson-heading compact-heading create-prep-heading">
        <p className="eyebrow">先看懂旋律與詞牌</p>
        <h1 id="create-title">要怎麼把文字「填」進一闋詞？</h1>
        <p>先看旋律如何接住文字，再看詞牌如何固定格式。</p>
      </header>

      {prepStep >= 1 && (
      <section className="origin-act create-situation" id="create-prep-1">
        <span className="act-number">第一步 · 代入情境</span>
        <h2>我準備好要填歌詞了！但是……音樂哪來呢？</h2>
        <p className="situation-line">我要自己譜曲嗎？不可能吧！我是大音痴ㄟ！</p>
        <div className="tune-entrance-card">
          <strong>詞牌正式登場</strong>
          <p>詞牌就是一副固定的旋律譜。不同詞牌，就是不同的旋律和格式；詞人依照詞牌的旋律填入文字。</p>
        </div>
        {prepStep === 1 && <Button onClick={() => advancePrep(2)}>看看詞牌怎麼提供旋律 <ArrowRight /></Button>}
      </section>
      )}

      {prepStep >= 2 && (
      <section className="origin-act mold-act" id="create-prep-2">
        <span className="act-number">第二步 · 看見詞牌的旋律譜</span>
        <h2>以〈虞美人〉這個詞牌來舉例</h2>
        <button type="button" className="tune-example-card" onClick={() => advancePrep(3)}>
          <span>詞牌</span><strong>虞美人</strong><small>點擊展開五線譜</small>
        </button>
      </section>
      )}

      {prepStep >= 3 && (
      <section className="origin-act score-act" id="create-prep-3">
        <span className="act-number">第三步 · 跟著旋律填字</span>
        <h2>一個音，接住一個字</h2>
        <p className="score-intro">
          五線譜上的音符有高有低，也有不同的長短。每顆音下方都有一格，歌詞會逐字填入。
        </p>
        <div className="score-card">
          <header>
            <div><span>詞牌</span><strong>虞美人</strong></div>
            <div className={topicFlash ? 'score-topic-field flash' : 'score-topic-field'}><span>題目</span><strong>{selectedWork.topic}</strong></div>
            <div><span>作者</span><strong>{selectedWork.author}</strong></div>
            <small>教學示意旋律｜宋代原曲多已失傳</small>
          </header>
          <YuMeiRenScore work={selectedWork} onTopicFlash={() => { setTopicFlash(true); window.setTimeout(() => setTopicFlash(false), 1300); }} />
          <div className="score-legend">
            <span>
              <i className="note-dot" /> 音符的位置表示音高
            </span>
            <span>
              <b className="rhythm-notes" aria-hidden="true">
                ♪ ♩ 𝅗𝅥
              </b>{' '}
              不同音符表示長短不同
            </span>
            <span>
              <i className="word-box" /> 一音一字的歌詞格
            </span>
          </div>
        </div>
        {(
          <>
            <div className="work-switchers" aria-label="切換其他虞美人作品">
              <span>同一副「虞美人」，也能換上不同內容：</span>
              {yuMeiRenWorks.map((work) => (
                <button
                  className={work.id === selectedWork.id ? 'current' : ''}
                  key={work.id}
                  onClick={() => setWorkId(work.id)}
                >
                  {work.author}・{work.label}
                </button>
              ))}
            </div>
            {prepStep === 3 && <Button onClick={() => advancePrep(4)}>我看見詞牌的固定格式了 <ArrowRight /></Button>}
          </>
        )}
      </section>
      )}

      {prepStep >= 4 && (
        <section className="origin-act ci-concept-quiz" id="create-prep-4">
          <span className="act-number">第四步 · 小測驗</span>
          <h2>先確認你看懂詞牌了嗎？</h2>
          <ConceptQuiz onComplete={() => advancePrep(5)} />
        </section>
      )}

      {prepStep >= 5 && (
        <div className="creation-stage" id="create-prep-5">
          <header className="lesson-heading compact-heading">
            <p className="eyebrow">今天你是填詞人</p>
            <h2>來創作一闋詞吧！</h2>
            <p>你現在是個宋朝的詞人。首先，先抽個詞牌（音樂旋律）吧！</p>
          </header>

          <div
            className="poet-roleplay"
            aria-label="宋朝小詞人正在想像抽到的旋律"
          >
            <div className="poet-portrait" aria-hidden="true">
              <Image
                src="/ci-poet-girl-v2.png"
                alt=""
                width={1114}
                height={1376}
                sizes="(max-width: 700px) 168px, 222px"
                priority
              />
            </div>
            <div className="speech-bubble">
              希望可以抽到快樂的旋律。
              <Music2 />
            </div>
          </div>

          <CapsuleMachine phase={phase} pattern={pattern} spin={spinCapsule} />

          {pattern && (
            <div className="capsule-reveal" aria-live="polite">
              <div className="open-capsule">
                <span />
                <span />
              </div>
              <div>
                <span className="step-label">扭蛋打開了</span>
                <strong>{pattern.name}</strong>
                <p>{flattenPattern(pattern).join('・')} 字</p>
              </div>
              <div
                className="preview-mold"
                aria-label={`${pattern.name}模具空格`}
              >
                <ShapeGlyph shape={flattenPattern(pattern)} />
              </div>
            </div>
          )}

          {pattern && (
            <TopicWheel
              topic={topic}
              spinning={wheelSpinning}
              turns={wheelTurns}
              spin={spinTopic}
            />
          )}

          {pattern && topic && (
            <WritingMold
              key={`${pattern.id}-${topic}`}
              pattern={pattern}
              topic={topic}
              onPublished={() => { setPublished(true); onBoardPublished?.(); }}
            />
          )}
          {published && <Button className="page-advance" onClick={onNext}>下一站：詞的別稱 <ArrowRight /></Button>}
        </div>
      )}
    </section>
  );
}

function playWheelLock() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(130, audio.currentTime);
    gain.gain.setValueAtTime(0.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.045);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.045);
    oscillator.addEventListener('ended', () => audio.close());
  } catch {
    // The visual lock remains available when a browser blocks generated audio.
  }
}

function NumberWheel({
  value,
  min = 3,
  max = 8,
  label,
  locked = false,
  onChange,
  options,
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
  locked?: boolean;
  onChange: (value: number) => void;
  options?: number[];
}) {
  const choices = options ?? [min, Math.round((min + max) / 2), max];

  return (
    <div
      className={`number-choice-grid ${locked ? 'locked' : ''}`}
      aria-label={label}
    >
      {choices.map((choice) => <button type="button" key={choice} disabled={locked} className={value === choice ? 'selected' : ''} onClick={() => onChange(choice)}>{choice}</button>)}
    </div>
  );
}

function DiscoveryFlipCard({
  item,
  dramatic = false,
  flipped,
  onFlip,
}: {
  item: { key: string; front: string; back: string };
  dramatic?: boolean;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      className={`discovery-flip-card ${dramatic ? 'dramatic' : ''} ${flipped ? 'flipped' : ''}`}
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={
        flipped ? `${item.front}${item.back}` : `${item.front}點擊翻牌`
      }
    >
      <span className="flip-card-inner">
        <span className="flip-card-front">
          <small>點一下翻牌</small>
          <strong>{item.front}</strong>
        </span>
        <span className="flip-card-back">
          <strong>{item.back}</strong>
        </span>
      </span>
    </button>
  );
}

function DiscoveryFlipReveal({
  poem,
  rhymePositions,
  onContinue,
  continueLabel,
}: {
  poem: JuejuPoem;
  rhymePositions: number[];
  onContinue: () => void;
  continueLabel: string;
}) {
  const [flipped, setFlipped] = useState<string[]>([]);
  const wording = poem.charactersPerLine === 5 ? '五言' : '七言';
  const facts = [
    { key: 'lines', front: '共有幾句？', back: `${poem.lineCount}句` },
    {
      key: 'characters',
      front: '每句幾字？',
      back: `${poem.charactersPerLine}字`,
    },
    {
      key: 'rhymes',
      front: '哪幾句押韻？',
      back: `第${rhymePositions.join('、')}句`,
    },
  ];
  const names = [
    {
      key: 'wording',
      front: `每句${poem.charactersPerLine}字叫什麼？`,
      back: wording,
    },
    { key: 'form', front: '共有4句叫什麼？', back: '絕句' },
  ];
  const allFlipped = flipped.length === facts.length + names.length;

  function flip(key: string) {
    setFlipped((current) =>
      current.includes(key) ? current : [...current, key],
    );
  }

  return (
    <div className="jueju-reveal" aria-live="polite">
      <p className="flip-reveal-lead">把剛剛發現的結果一張張翻出來</p>
      <div className="fact-flip-grid">
        {facts.map((item) => (
          <DiscoveryFlipCard
            key={item.key}
            item={item}
            flipped={flipped.includes(item.key)}
            onFlip={() => flip(item.key)}
          />
        ))}
      </div>
      <div className="name-flip-grid">
        {names.map((item) => (
          <DiscoveryFlipCard
            key={item.key}
            item={item}
            dramatic
            flipped={flipped.includes(item.key)}
            onFlip={() => flip(item.key)}
          />
        ))}
      </div>
      {allFlipped && (
        <div className="poem-kind-finale">
          <span>觀察完成</span>
          <h3>沒錯！這就是{poem.kind}！</h3>
          <Button onClick={onContinue}>{continueLabel}</Button>
        </div>
      )}
    </div>
  );
}

function PoemObservation({
  poem,
  onContinue,
  continueLabel,
  candidateLabel,
  skipCounts = false,
}: {
  poem: JuejuPoem;
  onContinue: () => void;
  continueLabel: string;
  candidateLabel?: string;
  skipCounts?: boolean;
}) {
  const [lineChoice, setLineChoice] = useState(
    poem.lineCount === 3 ? 4 : poem.lineCount - 1,
  );
  const [characterChoice, setCharacterChoice] = useState(
    poem.charactersPerLine === 4 ? 5 : poem.charactersPerLine - 1,
  );
  const [countsLocked, setCountsLocked] = useState(skipCounts);
  const [countFeedback, setCountFeedback] = useState('');
  const [selectedRhymes, setSelectedRhymes] = useState<number[]>([]);
  const [lastAttempt, setLastAttempt] = useState({ index: -1, count: 0 });
  const requiredRhymes = poem.endings.flatMap((ending, index) =>
    ending.rhymes ? [index] : [],
  );
  const complete =
    countsLocked &&
    requiredRhymes.every((index) => selectedRhymes.includes(index));

  return (
    <section className="poem-observation" aria-labelledby={`${poem.id}-title`}>
      <header className="poem-title-row">
        <div>
          <span>觀察作品</span>
          <h2 id={`${poem.id}-title`}>{poem.title}</h2>
        </div>
        <strong>{poem.author}</strong>
      </header>

      {!countsLocked ? <div className="poem-lines observation-plain" aria-label={`${poem.title}全文`}>
        {poem.lines.map((line) => <p key={line}>{line}</p>)}
      </div> : <div className="poem-lines" aria-label={`${poem.title}全文`}>
        {poem.lines.map((line, index) => {
          const ending = poem.endings[index];
          const correct = selectedRhymes.includes(index);
          const revealed = correct || lastAttempt.index === index;
          const wrong = lastAttempt.index === index && !ending.rhymes;
          return (
            <button
              key={`${line}-${wrong ? lastAttempt.count : 0}`}
              type="button"
              className={`${correct ? 'rhyme-selected' : ''} ${wrong ? 'rhyme-wrong' : ''}`}
              onClick={() => {
                setLastAttempt((current) => ({
                  index,
                  count: current.count + 1,
                }));
                if (ending.rhymes) {
                  setSelectedRhymes((current) =>
                    current.includes(index) ? current : [...current, index],
                  );
                }
              }}
            >
              <em className="poem-line-number" aria-label={`第${index + 1}句`}>
                {index + 1}
              </em>
              <span>{line.slice(0, -1)}</span>
              <b className={revealed ? 'ending-revealed' : ''}>
                {ending.character}
              </b>
              {revealed && <small>{ending.zhuyin}</small>}
            </button>
          );
        })}
      </div>}

      {!skipCounts && <div className="poem-questions">
        <div className="wheel-question">
          <p>句子共有</p>
          <NumberWheel
            key={`${poem.id}-lines`}
            value={lineChoice}
            min={3}
            max={6}
            label="選擇詩的句數"
            locked={countsLocked}
            onChange={(value) => {
              setLineChoice(value);
              setCountFeedback('');
            }}
            options={[3, 4, 5]}
          />
          <p>句</p>
        </div>
        <div className="wheel-question">
          <p>每句共有</p>
          <NumberWheel
            key={`${poem.id}-characters`}
            value={characterChoice}
            min={4}
            max={8}
            label="選擇每句的字數"
            locked={countsLocked}
            onChange={(value) => {
              setCharacterChoice(value);
              setCountFeedback('');
            }}
            options={poem.charactersPerLine === 5 ? [4, 5, 6] : [6, 7, 8]}
          />
          <p>個字</p>
        </div>
        <div className="count-confirm-area">
          <Button
            onClick={() => {
              if (
                lineChoice === poem.lineCount &&
                characterChoice === poem.charactersPerLine
              ) {
                setCountsLocked(true);
                setCountFeedback('句數與字數都觀察正確！');
                playWheelLock();
              } else {
                setCountFeedback('再數一次：先看有幾句，再看每句有幾個字。');
              }
            }}
            disabled={countsLocked}
          >
            {countsLocked ? '已確定句數與字數' : '確定句數與字數'}
          </Button>
          {countFeedback && (
            <output className={countsLocked ? 'correct' : ''}>
              {countFeedback}
            </output>
          )}
        </div>
      </div>}

      {!skipCounts && countsLocked && <div className="rhyme-prompt standalone-rhyme-prompt"><strong>點擊有押韻的句子，看看是哪幾句需要押韻！</strong></div>}

      {skipCounts && <div className="rhyme-prompt standalone-rhyme-prompt"><strong>咦？那這首的押韻位置在哪幾句？請按出來。</strong></div>}

      {candidateLabel && countsLocked && !complete && (
        <div className="candidate-banner">{candidateLabel}</div>
      )}

      {complete && skipCounts ? <Button className="page-advance" onClick={onContinue}>比較三首詩的押韻位置 <ArrowRight /></Button> : complete && (
        <DiscoveryFlipReveal
          poem={poem}
          rhymePositions={requiredRhymes.map((index) => index + 1)}
          onContinue={onContinue}
          continueLabel={continueLabel}
        />
      )}
    </section>
  );
}

function PoemMiniCard({ poem }: { poem: JuejuPoem }) {
  return (
    <article className="poem-mini-card">
      <h3>〈{poem.title}〉</h3>
      <span>{poem.author}</span>
      <div className="poem-mini-lines" aria-label={`${poem.title}全文`}>
        {poem.lines.map((line, index) => (
          <p key={line}>
            <small>{index + 1}</small>
            {line}
          </p>
        ))}
      </div>
      <strong>4句</strong>
      <strong>每句{poem.charactersPerLine}字</strong>
      <b>→ {poem.kind}</b>
    </article>
  );
}

const lushiWorks = [
  { title: '過故人莊', author: '孟浩然', lines: ['故人具雞黍','邀我至田家','綠樹村邊合','青山郭外斜','開軒面場圃','把酒話桑麻','待到重陽日','還來就菊花'], rhyme: [1,3,5,7] },
  { title: '聞官軍收河南河北', author: '杜甫', lines: ['劍外忽傳收薊北','初聞涕淚滿衣裳','卻看妻子愁何在','漫卷詩書喜欲狂','白日放歌須縱酒','青春作伴好還鄉','即從巴峽穿巫峽','便下襄陽向洛陽'], rhyme: [1,3,5,7] },
];

function LushiSummaryReveal({ onContinue }: { onContinue: () => void }) {
  const [flipped, setFlipped] = useState<string[]>([]);
  const cards = [
    { key: 'lines', front: '每首共有幾句？', back: '8句' },
    { key: 'chars', front: '每句幾字？', back: '5字或7字' },
    { key: 'rhymes', front: '哪些句子押韻？', back: '第2、4、6、8句' },
    { key: 'wording', front: '每句5或7字叫什麼？', back: '五言或七言' },
    { key: 'form', front: '共有8句叫什麼？', back: '律詩' },
  ];
  const allFlipped = flipped.length === cards.length;
  return <div className="jueju-reveal lushi-summary-reveal" aria-live="polite">
    <p className="flip-reveal-lead">把兩首律詩的觀察結果翻出來</p>
    <div className="fact-flip-grid lushi-fact-grid">{cards.slice(0, 3).map((item) => <DiscoveryFlipCard key={item.key} item={item} flipped={flipped.includes(item.key)} onFlip={() => setFlipped((c) => c.includes(item.key) ? c : [...c, item.key])} />)}</div>
    <div className="name-flip-grid lushi-name-grid">{cards.slice(3).map((item) => <DiscoveryFlipCard key={item.key} item={item} dramatic flipped={flipped.includes(item.key)} onFlip={() => setFlipped((c) => c.includes(item.key) ? c : [...c, item.key])} />)}</div>
    {allFlipped && <div className="poem-kind-finale"><span>兩首律詩都觀察完成</span><h3>每首8句、每句5或7字，2468句押韻，七言！律詩！</h3><Button onClick={onContinue}>BUT！人生最重要就是這個BUT！ <ArrowRight /></Button></div>}
  </div>;
}

// oxlint-disable jsx-a11y/label-has-associated-control
function LushiPage({ next }: { next: () => void }) {
  const [workIndex, setWorkIndex] = useState(0);
  const [lineChoice, setLineChoice] = useState(7);
  const [charChoice, setCharChoice] = useState(4);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const work = lushiWorks[workIndex];
  const right = locked && lineChoice === 8 && (charChoice === (workIndex ? 7 : 5)) && work.rhyme.every((n) => selected.includes(n));
  if (showSummary) return <section className="jueju-lesson lushi-lesson"><span className="jueju-section-label">近體詩館 · 第二分頁</span><h1>律詩格律整理</h1><LushiSummaryReveal onContinue={next} /></section>;
  return <section className="jueju-lesson lushi-lesson"><span className="jueju-section-label">近體詩館 · 第二分頁</span><h1>律詩概念</h1><p>觀察八句律詩，找出它和絕句相同、又更長的格律。</p><div className="lushi-work-switch">{lushiWorks.map((item,index)=><button type="button" className={index===workIndex?'selected':''} key={item.title} onClick={()=>{setWorkIndex(index);setLocked(false);setSelected([]);}}>{item.title}</button>)}</div><article className="lushi-observation"><h2>〈{work.title}〉</h2><p>先觀察：這首詩共有幾句？每句幾字？</p>{!locked ? <div className="observation-plain">{work.lines.map((line)=><p key={line}>{line}</p>)}</div> : <div className="poem-lines">{work.lines.map((line,index)=><button type="button" key={line} className={selected.includes(index)?'rhyme-selected':''} onClick={()=>work.rhyme.includes(index)&&setSelected((c)=>c.includes(index)?c:c.concat(index))}><em className="poem-line-number">{index+1}</em><span>{line}</span></button>)}</div>}<div className="lushi-choices"><label>共有 <NumberWheel value={lineChoice} options={[7,8,9]} min={7} max={9} label="律詩句數" locked={locked} onChange={setLineChoice}/> 句</label><label>每句 <NumberWheel value={charChoice} options={workIndex ? [6,7,8] : [4,5,6]} min={4} max={8} label="律詩字數" locked={locked} onChange={setCharChoice}/> 字</label></div>{!locked&&<Button className="lushi-count-confirm" onClick={()=>setLocked(true)}>確定句數與字數</Button>}{locked&&<><p className="rhyme-prompt lushi-rhyme-prompt"><strong>請按出有押韻的句子。</strong></p>{right&&<Button className="page-advance" onClick={()=>{setCompleted((c)=>c.includes(workIndex)?c:c.concat(workIndex));if(workIndex===0){setWorkIndex(1);setLocked(false);setSelected([]);setLineChoice(7);setCharChoice(6);}else{setShowSummary(true);}}}>{completed.length===1?'BUT！人生最重要就是這個BUT！':'換看另一首律詩'} <ArrowRight/></Button>}</>}</article></section>;
}

// oxlint-enable jsx-a11y/label-has-associated-control

function RuleMatchReview({ onComplete }: { onComplete: () => void }) {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [ruleMatches, setRuleMatches] = useState<Record<string, string>>({});
  const rules = ['一定押韻', '可押可不押', '不押韻'];
  const rulesReady = rhymeRules.every(
    (item) => ruleMatches[item.position] === item.rule,
  );

  useEffect(() => {
    if (rulesReady) onComplete();
  }, [onComplete, rulesReady]);

  function placeRule(position: string, rule: string) {
    setRuleMatches((current) => ({ ...current, [position]: rule }));
    setSelectedRule(null);
  }

  return (
    <div className="rule-match-board">
      <section className="rule-drag-bank" aria-label="可拖曳的押韻規則">
        <h4>點選規則</h4>
        {rules.map((rule) => (
          <button
            type="button"
            key={rule}
            className={selectedRule === rule ? 'selected' : ''}
            onClick={() => setSelectedRule(rule)}
          >
            <span aria-hidden="true">☷</span>
            {rule}
          </button>
        ))}
        <p>先點規則，再點右邊的句位。</p>
      </section>
      <section className="rule-drop-targets" aria-label="押韻句位">
        <h4>放到句位</h4>
        {rhymeRules.map((item) => {
          const answer = ruleMatches[item.position];
          const right = answer === item.rule;
          return (
            <button
              type="button"
              key={item.position}
              data-rule-position={item.position}
              className={answer ? (right ? 'correct' : 'wrong') : ''}
              onClick={() => {
                if (selectedRule) placeRule(item.position, selectedRule);
              }}
            >
              <strong>{item.position}</strong>
              <span>{answer ?? '拖到這裡'}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function JuejuReview({ onComplete }: { onComplete: () => void }) {
  const [lineChoice, setLineChoice] = useState(3);
  const [lineReady, setLineReady] = useState(false);
  const [lineFeedback, setLineFeedback] = useState('');
  const [characterChoices, setCharacterChoices] = useState<number[]>([]);
  const charactersReady =
    characterChoices.length === 2 &&
    characterChoices.includes(5) &&
    characterChoices.includes(7);
  const [rulesReady, setRulesReady] = useState(false);
  const complete = lineReady && charactersReady && rulesReady;

  useEffect(() => {
    if (complete) onComplete();
  }, [complete, onComplete]);

  return (
    <section className="jueju-review" aria-labelledby="jueju-review-title">
      <span className="act-number">本頁總複習</span>
      <h2 id="jueju-review-title">《完成你的絕句格律卡》</h2>

      <div className="review-step">
        <h3>一、絕句共有幾句？</h3>
        <div className="wheel-question compact-wheel-question">
          <p>絕句共有</p>
          <NumberWheel
            value={lineChoice}
            min={3}
            max={6}
            label="選擇絕句句數"
            locked={lineReady}
            onChange={(value) => {
              setLineChoice(value);
              setLineFeedback('');
            }}
            options={[3, 4, 5]}
          />
          <p>句</p>
        </div>
        <div className="count-confirm-area review-confirm-area">
          <Button
            disabled={lineReady}
            onClick={() => {
              if (lineChoice === 4) {
                setLineReady(true);
                setLineFeedback('正確，絕句共有4句。');
                playWheelLock();
              } else {
                setLineFeedback('再想想看，絕句共有幾句？');
              }
            }}
          >
            {lineReady ? '已確定' : '確定'}
          </Button>
          {lineFeedback && (
            <output className={lineReady ? 'correct' : ''}>
              {lineFeedback}
            </output>
          )}
        </div>
      </div>

      <div className="review-step">
        <h3>二、絕句每句可能有幾個字？ <small>（複選題）</small></h3>
        <div className="character-choice-grid">
          {[5, 6, 7, 8].map((number) => (
            <button
              key={number}
              type="button"
              className={
                characterChoices.includes(number)
                  ? number === 5 || number === 7
                    ? 'correct'
                    : 'wrong'
                  : ''
              }
              onClick={() =>
                setCharacterChoices((current) =>
                  current.includes(number)
                    ? current.filter((item) => item !== number)
                    : [...current, number],
                )
              }
            >
              {number}字
            </button>
          ))}
        </div>
        {charactersReady && (
          <div className="character-morph">
            <span>
              <b>5字</b>
              <ArrowRight />
              五言絕句
            </span>
            <span>
              <b>7字</b>
              <ArrowRight />
              七言絕句
            </span>
          </div>
        )}
      </div>

      <div className="review-step">
        <h3>三、把押韻規則放到正確句位</h3>
        <RuleMatchReview onComplete={() => setRulesReady(true)} />
      </div>
    </section>
  );
}

function JuejuPage({ next }: { next: () => void }) {
  const [stage, setStage] = useState(0);
  const [commonPositions, setCommonPositions] = useState<number[]>([]);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [structureVisible, setStructureVisible] = useState(true);
  const jingye = juejuPoems[0];
  const fengqiao = juejuPoems[1];
  const dengguan = juejuPoems[2];

  function moveTo(nextStage: number) {
    setStage(nextStage);
    window.setTimeout(
      () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      30,
    );
  }

  if (stage === 0) {
    return (
      <section
        className={`jueju-lesson structure-opening ${structureVisible ? '' : 'leaving'}`}
      >
        <span className="jueju-section-label">近體詩館 · 第一分頁</span>
        <h1>近體詩：兩條路</h1>
        <div className="modern-poetry-branch" aria-label="近體詩分成絕句和律詩">
          <strong>近體詩</strong>
          <i aria-hidden="true" />
          <div><span>絕句</span><small>四句</small></div>
          <div><span>律詩</span><small>八句</small></div>
        </div>
        <p className="branch-lead">我們來認識他們的結構吧！</p>
        <h2>什麼叫「結構」？</h2>
        <div className="car-structure-card">
          <Image
            src="/jueju-car-structure.png"
            alt="汽車車身、車門、車輪與座椅的分解結構"
            width={1536}
            height={1024}
            priority
          />
          <span className="car-label body-label">車身</span>
          <span className="car-label door-label">車門</span>
          <span className="car-label wheel-label">車輪</span>
          <span className="car-label seat-label">座椅</span>
        </div>
        <p className="structure-definition">
          結構，就是一個東西由哪些部分組成，以及這些部分怎麼排列。
        </p>
        <Button
          onClick={() => {
            setStructureVisible(false);
            window.setTimeout(() => moveTo(1), 320);
          }}
        >
          我了解結構了 <ArrowRight />
        </Button>
      </section>
    );
  }

  if (stage === 1) {
    return (
      <section className="jueju-lesson">
        <p className="poem-entry-question">
          那麼，這首耳熟能詳的詩，它的結構長怎麼樣呢？
        </p>
        <PoemObservation
          poem={jingye}
          onContinue={() => moveTo(2)}
          continueLabel="接著看看：所有絕句一定都是五個字為一句嗎？"
        />
      </section>
    );
  }

  if (stage === 2) {
    return (
      <section className="jueju-lesson">
        <PoemObservation
          poem={fengqiao}
          onContinue={() => moveTo(3)}
          continueLabel="比較兩首作品"
        />
      </section>
    );
  }

  if (stage === 3) {
    return (
      <section className="jueju-lesson comparison-stage">
        <span className="jueju-section-label">把兩次觀察放在一起</span>
        <h1>絕句的句數相同，每句字數可以不同</h1>
        <div className="poem-mini-grid">
          <PoemMiniCard poem={jingye} />
          <PoemMiniCard poem={fengqiao} />
        </div>
        <div className="first-model">
          <strong>絕句都是4句</strong>
          <span>每句5字叫五言絕句</span>
          <span>每句7字叫七言絕句</span>
        </div>
        <Button className="challenge-button" onClick={() => moveTo(4)}>
          真的嗎！？只要符合以上規則一定就是絕句了嗎！？
        </Button>
      </section>
    );
  }

  if (stage === 4) {
    return (
      <section className="jueju-lesson">
        <PoemObservation
          poem={dengguan}
          onContinue={() => moveTo(5)}
          continueLabel="比較三首詩的押韻位置"
          skipCounts
        />
      </section>
    );
  }

  if (stage === 5) {
    const discoveryReady =
      commonPositions.length === 2 &&
      commonPositions.includes(2) &&
      commonPositions.includes(4);
    return (
      <section className="jueju-lesson rule-discovery-stage">
        <span className="jueju-section-label">第三次觀察 · 修正原來的想法</span>
        <h1>三首詩的押韻位置，哪裡一定相同？</h1>
        <div className="rhyme-comparison-table">
          <div>
            <strong>作品</strong>
            <b>1</b>
            <b>2</b>
            <b>3</b>
            <b>4</b>
          </div>
          <div>
            <strong>靜夜思</strong>
            <span>✓</span>
            <span>✓</span>
            <span>×</span>
            <span>✓</span>
          </div>
          <div>
            <strong>楓橋夜泊</strong>
            <span>✓</span>
            <span>✓</span>
            <span>×</span>
            <span>✓</span>
          </div>
          <div>
            <strong>登鸛雀樓</strong>
            <span className="optional-rhyme">△</span>
            <span>✓</span>
            <span>×</span>
            <span>✓</span>
          </div>
        </div>
        <div className="common-position-picker">
          {[1, 2, 3, 4].map((position) => (
            <button
              type="button"
              key={position}
              className={
                commonPositions.includes(position)
                  ? position === 2 || position === 4
                    ? 'correct'
                    : 'wrong'
                  : ''
              }
              onClick={() =>
                setCommonPositions((current) =>
                  current.includes(position)
                    ? current.filter((item) => item !== position)
                    : [...current, position],
                )
              }
            >
              第{position}句
            </button>
          ))}
        </div>
        {discoveryReady && (
          <div className="rhyme-rule-reveal">
            <h2>絕句的押韻規則</h2>
            <div className="rule-cards">
              {rhymeRules.map((item) => (
                <div key={item.position}>
                  <strong>{item.position}</strong>
                  <span>{item.rule}</span>
                </div>
              ))}
            </div>
            <p>偶數句一定押韻，第一句可以押也可以不押。</p>
            <Button onClick={() => moveTo(6)}>
              我來完成絕句結構卡 <ArrowRight />
            </Button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="jueju-lesson final-review-stage">
      <JuejuReview onComplete={() => setReviewComplete(true)} />
      {reviewComplete && (
        <div className="completed-structure-card" aria-live="polite">
          <span>已完成</span>
          <h1>絕句格律卡</h1>
          <div className="structure-card-grid">
            <section>
              <h2>句數</h2>
              <strong>4句</strong>
            </section>
            <section>
              <h2>字數</h2>
              <p>每句5字 → 五言絕句</p>
              <p>每句7字 → 七言絕句</p>
            </section>
            <section>
              <h2>押韻</h2>
              {rhymeRules.map((item) => (
                <p key={item.position}>
                  {item.position} → {item.rule.replace('韻', '')}
                </p>
              ))}
            </section>
          </div>
          <div className="reviewed-poems">
            {juejuPoems.map((poem) => (
              <span key={poem.id}>〈{poem.title}〉</span>
            ))}
          </div>
          <h2>絕句的基本結構，你已經找到了！</h2>
          <Button onClick={next}>
            你已學會了絕句的格律！ <ArrowRight />
          </Button>
        </div>
      )}
    </section>
  );
}

function QualityPoemSheet({
  item,
  revealed,
  onReveal,
}: {
  item: QualityCase;
  revealed: number[];
  onReveal: (index: number) => void;
}) {
  return (
    <article className="quality-poem-sheet">
      <header>
        <div>
          <span>待檢卷宗</span>
          <h2>〈{item.title}〉</h2>
        </div>
        <strong>身分尚未公布</strong>
      </header>
      <div
        className="poem-lines quality-poem-lines"
        aria-label={`${item.title}全文`}
      >
        {item.lines.map((line, index) => {
          const ending = item.endings[index];
          const isRevealed = revealed.includes(index);
          return (
            <button
              type="button"
              key={line}
              className={isRevealed ? 'ending-inspected' : ''}
              onClick={() => onReveal(index)}
            >
              <em className="poem-line-number" aria-label={`第${index + 1}句`}>
                {index + 1}
              </em>
              <span>{line.slice(0, -1)}</span>
              <b className={isRevealed ? 'ending-revealed' : ''}>
                {ending.character}
              </b>
              {isRevealed && <small>{ending.zhuyin}</small>}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function JuejuQualityPage({ finish }: { finish: () => void }) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [gate, setGate] = useState<'line' | 'character' | 'rhyme'>('line');
  const [feedback, setFeedback] = useState('');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [resolved, setResolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const item = qualityCases[caseIndex];
  const gateNumber = gate === 'line' ? 1 : gate === 'character' ? 2 : 3;

  const options: { label: string; value: QualityDecision }[] =
    gate === 'line'
      ? [
          { label: '符合4句規格', value: 'four-lines' },
          { label: '句數不合', value: 'not-four-lines' },
        ]
      : gate === 'character'
        ? [
            { label: '五言候選', value: 'five-character' },
            { label: '七言候選', value: 'seven-character' },
            { label: '字數不合', value: 'invalid-character-count' },
          ]
        : [
            { label: '押韻合格', value: 'rhyme-pass' },
            { label: '押韻故障', value: 'rhyme-fail' },
          ];

  function expectedDecision() {
    if (gate === 'line') return item.expected.lineGate;
    if (gate === 'character') return item.expected.characterGate;
    return item.expected.rhymeGate;
  }

  function chooseDecision(value: QualityDecision) {
    if (value !== expectedDecision()) {
      setFeedback(
        gate === 'line'
          ? '再看一次句前小數字，確認這份卷宗共有幾句。'
          : gate === 'character'
            ? '請挑一句逐字數；句前小數字不算在詩句內。'
            : '再比較第2、4句的句尾聲音，它們是否相押？',
      );
      return;
    }

    setFeedback('');
    if (gate === 'line') {
      setGate('character');
      return;
    }
    if (gate === 'character' && item.expected.rhymeGate) {
      setGate('rhyme');
      return;
    }
    setResolved(true);
  }

  function nextCase() {
    if (caseIndex === qualityCases.length - 1) {
      setFinished(true);
      return;
    }
    setCaseIndex((current) => current + 1);
    setGate('line');
    setFeedback('');
    setRevealed([]);
    setResolved(false);
    window.setTimeout(
      () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      30,
    );
  }

  if (finished) {
    return (
      <section className="jueju-lesson quality-complete" aria-live="polite">
        <span className="jueju-section-label">絕句品管局 · 檢驗完成</span>
        <div className="quality-badge" aria-hidden="true">
          <ShieldCheck />
        </div>
        <h1>三份卷宗全數完成品管</h1>
        <p>你已經能把「4句、每句5或7字、第2、4句一定押韻」當成檢驗工具。</p>
        <div className="quality-summary-stamps">
          {qualityCases.map((qualityCase) => (
            <span key={qualityCase.id}>
              〈{qualityCase.title}〉 {qualityCase.result}
            </span>
          ))}
        </div>
        <Button onClick={finish}>
          完成品管，回到韻文時間圖 <ArrowRight />
        </Button>
      </section>
    );
  }

  return (
    <section className="jueju-lesson quality-station">
      <header className="quality-station-header">
        <div>
          <span className="jueju-section-label">近體詩館 · 第二分頁</span>
          <h1>《絕句品管局》</h1>
          <p>本局只檢查剛學過的句數、字數與押韻三項基本規格。</p>
        </div>
        <div
          className="quality-progress"
          aria-label={`第${caseIndex + 1}份，共3份`}
        >
          <strong>{caseIndex + 1}</strong>
          <span>/ 3 份卷宗</span>
        </div>
      </header>

      <QualityPoemSheet
        item={item}
        revealed={revealed}
        onReveal={(index) =>
          setRevealed((current) =>
            current.includes(index) ? current : [...current, index],
          )
        }
      />

      <section className="inspection-console">
        <div className="inspection-track" aria-label="檢驗進度">
          {['句數', '字數', '押韻'].map((label, index) => (
            <span
              key={label}
              className={
                gateNumber > index + 1
                  ? 'passed'
                  : gateNumber === index + 1
                    ? 'active'
                    : ''
              }
            >
              {index + 1} {label}
            </span>
          ))}
        </div>

        {!resolved ? (
          <div className="inspection-question">
            <span>檢驗門 {gateNumber}</span>
            <h2>
              {gate === 'line'
                ? '這份卷宗符合4句規格嗎？'
                : gate === 'character'
                  ? '每句字數應該蓋哪一種章？'
                  : '點開第2、4句的聲音線索，再判斷押韻。'}
            </h2>
            <div className="inspection-options">
              {options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  disabled={
                    gate === 'rhyme' &&
                    (!revealed.includes(1) || !revealed.includes(3))
                  }
                  onClick={() => chooseDecision(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {gate === 'rhyme' &&
              (!revealed.includes(1) || !revealed.includes(3)) && (
                <p className="inspection-hint">請先點詩的第2、4句。</p>
              )}
            {feedback && (
              <output className="inspection-feedback">{feedback}</output>
            )}
          </div>
        ) : (
          <div
            className={`quality-verdict ${item.result === '基礎規格合格' ? 'approved' : 'returned'}`}
            aria-live="polite"
          >
            <span>{item.result === '基礎規格合格' ? '通過' : '退件'}</span>
            <h2>{item.result}</h2>
            <div className="quality-identity-reveal">
              <strong>{item.sourceLabel}</strong>
              <span>
                〈{item.title}〉·{item.author}
              </span>
            </div>
            <p>{item.finding}</p>
            <Button onClick={nextCase}>
              {caseIndex === qualityCases.length - 1
                ? '查看品管結果'
                : '檢查下一份卷宗'}{' '}
              <ArrowRight />
            </Button>
          </div>
        )}
      </section>
    </section>
  );
}

export default function Home() {
  const [page, setPage] = useState<PageId | null>(null);
  const [highlightedHall, setHighlightedHall] = useState<string | null>(null);
  const [boardAvailable, setBoardAvailable] = useState(() => {
    try { return localStorage.getItem('yunwen-board-available') === '1'; } catch { return false; }
  });
  const [boardOpen, setBoardOpen] = useState(false);
  const [boardRevision, setBoardRevision] = useState(0);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  useEffect(() => {
    const route = () => {
      const ciMatch = location.hash.match(
        /^#ci\/(origin|create|aliases|types|styles|checkpoint)$/,
      );
      const jintishiMatch = location.hash.match(/^#jintishi\/(jueju|lushi|duizhang|quality)$/);
      if (ciMatch) setPage(ciMatch[1] as PageId);
      else if (jintishiMatch)
        setPage(jintishiMatch[1] === 'quality' ? 'jueju-quality' : jintishiMatch[1] as PageId);
      else setPage(null);
    };
    route();
    window.addEventListener('hashchange', route);
    return () => window.removeEventListener('hashchange', route);
  }, []);

  function handleBoardPublished() {
    setBoardAvailable(true);
    setBoardOpen(true);
    setBoardRevision((value) => value + 1);
    try { localStorage.setItem('yunwen-board-available', '1'); } catch {}
  }

  function navigate(next: PageId | null) {
    if (next === 'jueju') location.hash = 'jintishi/jueju';
    else if (next === 'lushi') location.hash = 'jintishi/lushi';
    else if (next === 'duizhang') location.hash = 'jintishi/duizhang';
    else if (next === 'jueju-quality') location.hash = 'jintishi/quality';
    else location.hash = next ? `ci/${next}` : 'map';
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderLesson() {
    switch (page) {
      case 'origin':
        return <OriginPage next={() => navigate('create')} />;
      case 'create':
        return <CreatePage onBoardPublished={handleBoardPublished} onNext={() => navigate('aliases')} />;
      case 'aliases':
        return <AliasesPage next={() => navigate('types')} />;
      case 'types':
        return <TypesPage next={() => navigate('styles')} />;
      case 'styles':
        return <StylesPage next={() => navigate('checkpoint')} />;
      case 'checkpoint':
        return <CheckpointPage />;
      case 'jueju':
        return <JuejuPage next={() => navigate('lushi')} />;
      case 'lushi':
        return <LushiPage next={() => navigate('duizhang')} />;
      case 'duizhang':
        return <section className="lesson knowledge-page"><h1>律詩的對仗規則</h1><p>這一頁即將開放。</p></section>;
      case 'jueju-quality':
        return <JuejuQualityPage finish={() => navigate(null)} />;
      default:
        return null;
    }
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>
      <header className="site-header">
        <button className="brand" onClick={() => navigate(null)}>
          <Grid2X2 /> 韻文時空館
        </button>
        <span className="header-note">國中國文 · 互動探索</span>
        <span className="tag">
          {!page
            ? '六館導覽'
            : ['jueju','lushi','duizhang','jueju-quality'].includes(page)
              ? '近體詩館'
              : '詞館 · 六個分頁'}
        </span>
        {boardAvailable && (
          <button className="global-board-entry" type="button" onClick={() => setBoardOpen(true)}>
            <Megaphone /> 汴京城佈告欄
          </button>
        )}
      </header>

      <main id="main-content" className={page ? 'inside-view' : 'home-view'}>
        {page ? (
          <div className="museum-shell">
            <div className="left-corner">
              <Button variant="ghost" onClick={() => navigate(null)}>
                <ArrowLeft /> 回時間圖
              </Button>
              <TimelineRail
                currentHall={
                  ['jueju','lushi','duizhang','jueju-quality'].includes(page) ? '近體詩' : '詞'
                }
              />
              <nav
                className="page-nav"
                aria-label={
                  ['jueju','lushi','duizhang','jueju-quality'].includes(page)
                    ? '近體詩館頁面'
                    : '詞館頁面'
                }
              >
                {(['jueju','lushi','duizhang','jueju-quality'].includes(page)
                  ? JINTISHI_PAGES
                  : PAGES
                ).map((item) => (
                  <button
                    key={item.id}
                    className={page === item.id ? 'current' : ''}
                    aria-current={page === item.id ? 'page' : undefined}
                    onClick={() => navigate(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="lesson-main">{renderLesson()}</div>
          </div>
        ) : (
          <div className="home">
            <header className="home-intro">
              <div>
                <p className="eyebrow">六個時代座標 · 一條韻文時間線</p>
                <h1 aria-live="polite">
                  {highlightedHall === '詞'
                    ? '走進詞的誕生現場'
                    : highlightedHall === '近體詩'
                      ? '去一睹唐代詩人的風采吧！'
                      : '沿著時間軸，搭上時光機吧！'}
                </h1>
              </div>
            </header>
            <section className="horizontal-timeline" aria-label="韻文時間軸">
              <div className="timeline-track">
                {halls.map((hall, index) => {
                  const content = (
                    <>
                      <span className="hall-number">0{index + 1}</span>
                      <h2>{hall.name}</h2>
                      <ShapeGlyph shape={hall.shape} />
                      <p>{hall.note}</p>
                      {hall.name === '詞' || hall.name === '近體詩' ? (
                        <button
                          className="enter-cta"
                          onFocus={() => setHighlightedHall(hall.name)}
                          onBlur={() => setHighlightedHall(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(hall.name === '詞' ? 'origin' : 'jueju');
                          }}
                        >
                          進入{hall.name}館 <ArrowRight />
                        </button>
                      ) : (
                        <span className="soon">後續開放</span>
                      )}
                    </>
                  );
                  return (
                    <article
                      className={`timeline-stop ${highlightedHall === hall.name ? 'active' : ''}`}
                      key={hall.name}
                    >
                      <span className="era-label">{hall.era}</span>
                      <span className="time-dot">
                        <i />
                      </span>
                      {hall.name === '詞' || hall.name === '近體詩' ? (
                        <div
                          className="hall-card interactive-hall"
                          onPointerEnter={() => setHighlightedHall(hall.name)}
                          onPointerLeave={(event) => {
                            if (event.pointerType === 'mouse')
                              setHighlightedHall(null);
                          }}
                          onPointerUp={() => setHighlightedHall(hall.name)}
                        >
                          {content}
                        </div>
                      ) : (
                        <div className="hall-card">{content}</div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="site-credit">
        本站由蘇牧盈老師發想設計，Codex協助製作。
      </footer>
      {boardOpen && (
        <div className="board-overlay">
          <button className="board-overlay-backdrop" type="button" aria-label="關閉佈告欄" onClick={() => setBoardOpen(false)} />
          <dialog open className="board-drawer" aria-labelledby="global-board-title">
            <div className="board-drawer-header">
              <div><span className="eyebrow">作品共享區</span><h2 id="global-board-title">汴京城佈告欄</h2></div>
              <button type="button" className="board-overlay-close" onClick={() => setBoardOpen(false)}>關閉</button>
            </div>
            <BianjingBoard revision={boardRevision} adminPassword={adminPassword ?? undefined} onPasswordChanged={setAdminPassword} onExitAdmin={() => setAdminPassword(null)} />
            {!adminPassword && <BoardAdminAccess onAuthenticated={(password) => { setAdminPassword(password); setBoardRevision((value) => value + 1); }} />}
          </dialog>
        </div>
      )}
    </>
  );
}
