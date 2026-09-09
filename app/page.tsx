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

type PageId = 'origin' | 'create';
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
  { id: 'create', label: '02 填詞工作室', title: '抽一副詞牌，寫自己的題目' },
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

function TimelineRail() {
  return (
    <aside className="era-rail" aria-label="韻文時間軸，目前位於詞">
      <span className="rail-title">你在這裡</span>
      <div className="rail-line">
        {halls.map((hall) => (
          <div
            className={`rail-stop ${hall.name === '詞' ? 'current' : ''}`}
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
    topic: '亡國之痛',
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
    topic: '一生聽雨',
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
    id: 'qin-guan',
    author: '秦觀',
    label: '碧桃天上栽和露',
    topic: '碧桃惜春',
    lines: [
      '碧桃天上栽和露',
      '不是凡花數',
      '亂山深處水瀠洄',
      '可惜一枝如畫向誰開',
      '輕寒細雨情何限',
      '不道春難管',
      '為君沉醉又何妨',
      '只怕酒醒時候斷人腸',
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
  4, 5, 6, 7, 6, 5, 4, 3, 4, 5, 4, 3, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 6, 5, 4, 3,
  4, 5, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 5, 4, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 7, 6,
  5, 4, 3, 4,
];

function curvedPitchPath(points: { x: number; y: number }[]) {
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middle = (previous.x + point.x) / 2;
    return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

function YuMeiRenScore({ work }: { work: (typeof yuMeiRenWorks)[number] }) {
  const characters = work.lines.join('').split('');
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
              <path className="pitch-guide" d={curvedPitchPath(points)} />
              <line
                className="measure-line"
                x1={92 + (system.split - 0.5) * step}
                x2={92 + (system.split - 0.5) * step}
                y1={baseY}
                y2={baseY + 40}
              />
              {points.map((point) => (
                <g key={point.index}>
                  <g
                    className="score-note"
                    style={{ animationDelay: `${point.index * 45}ms` }}
                  >
                    <ellipse cx={point.x} cy={point.y} rx="8" ry="6" />
                    <line
                      x1={point.x + 7}
                      x2={point.x + 7}
                      y1={point.y}
                      y2={point.y - 27}
                    />
                  </g>
                  <rect
                    className="lyric-cell"
                    x={point.x - 16}
                    y={baseY + 57}
                    width="32"
                    height="34"
                    rx="4"
                  />
                  <text
                    className="lyric-character"
                    x={point.x}
                    y={baseY + 81}
                    style={{ animationDelay: `${1100 + point.index * 55}ms` }}
                  >
                    {characters[point.index]}
                  </text>
                </g>
              ))}
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
  const [workId, setWorkId] = useState(yuMeiRenWorks[0].id);
  const [scoreReady, setScoreReady] = useState(false);
  const selectedWork =
    yuMeiRenWorks.find((work) => work.id === workId) ?? yuMeiRenWorks[0];
  const originsReady = litSources.length === originStreams.length;

  useEffect(() => {
    if (step < 2 || scoreReady) return;
    const timer = window.setTimeout(() => setScoreReady(true), 4450);
    return () => window.clearTimeout(timer);
  }, [scoreReady, step]);

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
            <strong>答案藏在四段旅程裡。</strong>
            <span>跟著音樂、文字與時間，一步一步找出來。</span>
          </div>
        </header>

        <section className="origin-act source-act" id="origin-act-1">
          <span className="act-number">第一幕</span>
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
          {originsReady && step === 1 && (
            <Button onClick={() => advance(2)}>
              看文字怎麼跟著旋律走 <ArrowRight />
            </Button>
          )}
        </section>

        {step >= 2 && (
          <section className="origin-act score-act" id="origin-act-2">
            <span className="act-number">第二幕</span>
            <h2>一個音，接住一個字</h2>
            <p className="score-intro">
              五線譜顯示音高；綠色曲線把高低連起來。每顆音下方都有一格，歌詞會逐字填入。
            </p>
            <div className="score-card">
              <header>
                <div>
                  <span>詞牌</span>
                  <strong>虞美人</strong>
                </div>
                <div>
                  <span>作者</span>
                  <strong>{selectedWork.author}</strong>
                </div>
                <div>
                  <span>內容</span>
                  <strong>{selectedWork.topic}</strong>
                </div>
                <small>教學示意旋律｜宋代原曲多已失傳</small>
              </header>
              <YuMeiRenScore key={selectedWork.id} work={selectedWork} />
              <div className="score-legend">
                <span>
                  <i className="note-dot" /> 五線譜上的音
                </span>
                <span>
                  <i className="curve-line" /> 看得懂的音高曲線
                </span>
                <span>
                  <i className="word-box" /> 一音一字的歌詞格
                </span>
              </div>
            </div>
            {scoreReady && (
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
                {step === 2 && (
                  <Button onClick={() => advance(3)}>
                    原來詞牌就是一副模具 <ArrowRight />
                  </Button>
                )}
              </>
            )}
          </section>
        )}

        {step >= 3 && (
          <section className="origin-act mold-act" id="origin-act-3">
            <span className="act-number">第三幕</span>
            <h2>詞牌把旋律變成填詞規則</h2>
            <div className="mold-rules">
              <span>
                <strong>定句數</strong>要分成幾句
              </span>
              <span>
                <strong>定字數</strong>每句放幾字
              </span>
              <span>
                <strong>定聲律</strong>平仄與押韻的位置
              </span>
            </div>
            <p>
              同一詞牌保留相同的音樂與格式；作者可以填入不同題目和內容。這就是「倚聲填詞」。
            </p>
            {step === 3 && (
              <Button onClick={() => advance(4)}>
                看詞走過哪些時代 <ArrowRight />
              </Button>
            )}
          </section>
        )}

        {step >= 4 && (
          <section className="origin-act history-act" id="origin-act-4">
            <span className="act-number">第四幕</span>
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
            <Button className="origin-next" onClick={next}>
              我懂了，去抽一副詞牌！ <ArrowRight />
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
      setPublishMessage('張貼成功！全城的詞人都能在佈告欄看見這首作品。');
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
                    ? '上闋'
                    : '下闋'
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
          <strong>城門剛開，等你張貼第一首詞！</strong>
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

function CreatePage() {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [pattern, setPattern] = useState<CiPattern | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelTurns, setWheelTurns] = useState(0);
  const [boardRevision, setBoardRevision] = useState(0);
  const [boardVisible, setBoardVisible] = useState(false);
  const [publishedThisSession, setPublishedThisSession] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

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
      <header className="lesson-heading compact-heading">
        <p className="eyebrow">第二幕 · 今天你是填詞人</p>
        <h1 id="create-title">你現在是個宋朝的詞人，來創作吧！</h1>
        <p>首先，先抽個詞牌（音樂旋律）吧！</p>
      </header>

      <div className="poet-roleplay" aria-label="宋朝小詞人正在想像抽到的旋律">
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
          <div className="preview-mold" aria-label={`${pattern.name}模具空格`}>
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
          onPublished={() => {
            setPublishedThisSession(true);
            setBoardVisible(true);
            setBoardRevision((value) => value + 1);
          }}
        />
      )}

      {boardVisible && (
        <div className="board-arrival">
          <BianjingBoard
            revision={boardRevision}
            adminPassword={adminPassword ?? undefined}
            onPasswordChanged={setAdminPassword}
            onExitAdmin={() => {
              setAdminPassword(null);
              setBoardVisible(publishedThisSession);
            }}
          />
        </div>
      )}

      <BoardAdminAccess
        onAuthenticated={(password) => {
          setAdminPassword(password);
          setBoardVisible(true);
          setBoardRevision((value) => value + 1);
        }}
      />
    </section>
  );
}

export default function Home() {
  const [page, setPage] = useState<PageId | null>(null);
  const [highlightedHall, setHighlightedHall] = useState<string | null>(null);

  useEffect(() => {
    const route = () => {
      const match = location.hash.match(/^#ci\/(origin|create)$/);
      setPage(match ? (match[1] as PageId) : null);
    };
    route();
    window.addEventListener('hashchange', route);
    return () => window.removeEventListener('hashchange', route);
  }, []);

  function navigate(next: PageId | null) {
    location.hash = next ? `ci/${next}` : 'map';
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <span className="tag">詞館 · 前兩頁</span>
      </header>

      <main id="main-content" className={page ? 'inside-view' : 'home-view'}>
        {page ? (
          <div className="museum-shell">
            <div className="left-corner">
              <Button variant="ghost" onClick={() => navigate(null)}>
                <ArrowLeft /> 回時間圖
              </Button>
              <TimelineRail />
              <nav className="page-nav" aria-label="詞館頁面">
                {PAGES.map((item) => (
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
            <div className="lesson-main">
              {page === 'origin' ? (
                <OriginPage next={() => navigate('create')} />
              ) : (
                <CreatePage />
              )}
            </div>
          </div>
        ) : (
          <div className="home">
            <header className="home-intro">
              <div>
                <p className="eyebrow">六個時代座標 · 一條韻文時間線</p>
                <h1 aria-live="polite">
                  {highlightedHall === '詞'
                    ? '走進詞的誕生現場'
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
                      {hall.name === '詞' ? (
                        <button
                          className="enter-cta"
                          onFocus={() => setHighlightedHall(hall.name)}
                          onBlur={() => setHighlightedHall(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate('origin');
                          }}
                        >
                          進入詞館 <ArrowRight />
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
                      {hall.name === '詞' ? (
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
    </>
  );
}
