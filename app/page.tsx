'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Dices,
  Grid2X2,
  Music2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ciPatterns,
  creationTopics,
  halls,
  learningSources,
  type CiPattern,
} from '@/data/ci-workshop';
import {
  countWritingCharacters,
  firstIncompleteLine,
  flattenPattern,
} from '@/lib/ci-workshop';

type PageId = 'origin' | 'create';
const PAGES: { id: PageId; label: string; title: string }[] = [
  { id: 'origin', label: '01 詞的由來', title: '唐詩怎麼走向宋詞？' },
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

function OriginPage({ next }: { next: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="lesson origin-lesson" aria-labelledby="origin-title">
      <header className="lesson-heading">
        <p className="eyebrow">第一幕 · 點擊展開</p>
        <h1 id="origin-title">唐詩怎麼走向宋詞？</h1>
        <p>先點「唐朝・近體詩」，看兩股力量怎麼把詩的形貌拉向詞。</p>
      </header>

      <div className={`origin-stage ${revealed ? 'revealed' : ''}`}>
        <button
          className="dynasty-card tang-card"
          aria-expanded={revealed}
          onClick={() => setRevealed(true)}
        >
          <span className="dynasty">唐朝</span>
          <strong>近體詩</strong>
          <ShapeGlyph shape={[7, 7, 7, 7]} />
          <span className="music-sample" aria-label="有些近體詩可以入樂">
            <Music2 className="sounding" />
            <Music2 className="sounding" />
            <Music2 className="silent" />
            <Music2 className="silent" />
          </span>
          <small>部分作品可入樂</small>
          {!revealed && <em>點我啟動變化</em>}
        </button>

        <div className="cause cause-left" aria-hidden={!revealed}>
          <Music2 />
          <span>接受外來音樂影響</span>
        </div>
        <div className="cause cause-right" aria-hidden={!revealed}>
          <Sparkles />
          <span>改變唐詩形貌</span>
        </div>

        <div className="birth-arrow" aria-hidden={!revealed}>
          <span />
          <ArrowDown />
        </div>

        <div className="dynasty-card song-card" aria-hidden={!revealed}>
          <span className="dynasty">宋朝</span>
          <strong>詞</strong>
          <ShapeGlyph shape={[6, 6, 5, 6, 2, 2, 6]} />
          <span className="all-music">
            <Music2 /> 依詞牌曲調填入歌詞
          </span>
        </div>
      </div>

      <div className={`discovery ${revealed ? 'show' : ''}`} aria-live="polite">
        {revealed && (
          <>
            <Check />
            <p>
              <strong>詞不是把唐詩任意切短。</strong>
              外來音樂帶來新的曲調，文字為了配合旋律，從整齊句式變成依詞牌安排的長短句。
            </p>
            <Button onClick={next}>
              去抽我的詞牌 <ArrowRight />
            </Button>
          </>
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
        <div className="gacha-globe">
          {ciPatterns.map((item, index) => (
            <i key={item.id} style={{ '--capsule': index } as React.CSSProperties} />
          ))}
        </div>
        <div className="gacha-neck" />
        <div className="gacha-body">
          <span className="gacha-knob"><RotateCcw /></span>
          <span className="gacha-mouth" />
        </div>
        <div className="falling-capsule" />
      </div>
      <div>
        <span className="step-label">第一抽 · 詞牌模具</span>
        <h2>{pattern ? pattern.name : '扭出今天的詞牌'}</h2>
        <p>五顆扭蛋裝著五副不同的詞牌格式。</p>
        <Button onClick={spin} disabled={phase === 'spinning'}>
          <Dices /> {phase === 'spinning' ? '扭蛋滾動中…' : pattern ? '再扭一次' : '轉動扭蛋'}
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
        <div className="topic-wheel" style={{ transform: `rotate(${turns}deg)` }}>
          <span>遲到</span>
          <span>考砸</span>
          <span>出遊</span>
        </div>
        <CircleDot className="wheel-hub" />
      </div>
      <div>
        <span className="step-label">第二抽 · 創作題目</span>
        <h2>{topic ?? '轉出真正要寫的題目'}</h2>
        <p>詞牌管格式；轉盤抽到的才是這次內容。</p>
        <Button onClick={spin} disabled={spinning}>
          <RotateCcw /> {spinning ? '轉盤旋轉中…' : topic ? '再轉一次' : '轉動題目盤'}
        </Button>
      </div>
    </section>
  );
}

function WritingMold({
  pattern,
  topic,
}: {
  pattern: CiPattern;
  topic: string;
}) {
  const [lines, setLines] = useState<string[]>(() =>
    Array(flattenPattern(pattern).length).fill(''),
  );
  const [message, setMessage] = useState('題目已貼好。現在把你的內容逐句填進模具。');
  const [complete, setComplete] = useState(false);

  function change(index: number, value: string) {
    setLines((current) => current.map((line, i) => (i === index ? value : line)));
    setComplete(false);
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
          <h2 id="writing-title">把題目寫進「{pattern.name}」的形狀</h2>
          <p>{pattern.guide}。本次先練句長；平仄、押韻留待教師帶領。</p>
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
              <legend>{pattern.stanzas.length > 1 ? `第 ${stanzaIndex + 1} 片` : '全闋'}</legend>
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
                    <b className={count === length ? 'matched' : count > length ? 'over' : ''}>
                      {count} / {length}
                    </b>
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>
      <div className={`writing-feedback ${complete ? 'complete' : ''}`} aria-live="polite">
        <p>{message}</p>
        <Button onClick={inspect}>
          <Check /> 檢查整副模具
        </Button>
      </div>
      {complete && (
        <p className="saved-note">
          草稿已保存在這台裝置。上傳位置等教師指定後，再接上這裡的作品送出功能。
        </p>
      )}
    </section>
  );
}

function CreatePage() {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [pattern, setPattern] = useState<CiPattern | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelTurns, setWheelTurns] = useState(0);
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
    setWheelTurns((turns) => turns + 1080 + index * 120 + 35);
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
        <h1 id="create-title">先抽詞牌，再抽題目</h1>
        <p>先決定文字要住進哪副模具，再決定今天真正要寫什麼。</p>
      </header>

      <CapsuleMachine phase={phase} pattern={pattern} spin={spinCapsule} />

      {pattern && (
        <div className="capsule-reveal" aria-live="polite">
          <div className="open-capsule"><span /><span /></div>
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
        />
      )}

      <details className="teaching-note">
        <summary>教師備註與資料來源</summary>
        <p>
          「山坡羊」是曲牌，因此未放入本頁詞牌扭蛋。本活動採各代表作的句長做初階模具；同一詞牌可能另有變體，正式填詞也需處理平仄與押韻。
        </p>
        <ul>
          {learningSources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export default function Home() {
  const [page, setPage] = useState<PageId | null>(null);

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
      <a href="#main-content" className="skip-link">跳至主要內容</a>
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
                <h1>沿著時間，走進詞的誕生現場。</h1>
              </div>
              <p>從左往右讀時間；垂直亮線標示文體曾彼此影響，不代表前一種消失後才有下一種。</p>
            </header>
            <section className="horizontal-timeline" aria-label="韻文時間軸">
              <div className="timeline-track">
                {halls.map((hall, index) => (
                  <article className={`timeline-stop ${hall.name === '詞' ? 'active' : ''}`} key={hall.name}>
                    <span className="era-label">{hall.era}</span>
                    <span className="time-dot"><i /></span>
                    <div className="hall-card">
                      <span className="hall-number">0{index + 1}</span>
                      <h2>{hall.name}</h2>
                      <ShapeGlyph shape={hall.shape} />
                      <p>{hall.note}</p>
                      {hall.name === '詞' ? (
                        <Button onClick={() => navigate('origin')}>
                          進入詞館 <ArrowRight />
                        </Button>
                      ) : (
                        <span className="soon">後續開放</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <p className="map-foot">
              <span /> 時間定位　　<b /> 文體影響關係
            </p>
          </div>
        )}
      </main>
    </>
  );
}
