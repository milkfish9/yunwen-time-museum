'use client';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  MoveLeft,
  Grid2X2,
  ArrowRight,
  Check,
  Map,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Progress, ProgressLabel } from '@/components/ui/progress';
import { halls, stages, sources } from '@/data/curriculum';
import { activities } from '@/components/learning';
import { readProgress } from '@/lib/learning';
const STORAGE = 'yunwen-p0-explored-v1';
export default function Home() {
  const [inside, setInside] = useState(false);
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [visited, setVisited] = useState<number[]>([0]);
  const [storageMessage, setStorageMessage] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [resetAsk, setResetAsk] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setDone(readProgress(localStorage.getItem(STORAGE)));
      } catch {
        setStorageMessage('此瀏覽器無法保存探索標記；本次仍可完成所有活動。');
      }
    });
    const route = () => {
      if (location.hash === '#main-content') return;
      const match = location.hash.match(/^#ci(?:\/(\d+))?$/);
      if (match) {
        const s = Math.max(0, Math.min(9, Number(match[1] ?? 0)));
        setStage(s);
        setVisited((v) => [...new Set([...v, s])]);
        setInside(true);
      } else setInside(false);
    };
    queueMicrotask(route);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE) setDone(readProgress(event.newValue));
    };
    window.addEventListener('hashchange', route);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('hashchange', route);
      window.removeEventListener('storage', sync);
    };
  }, []);
  function go(s: number) {
    setStage(s);
    setVisited((v) => [...new Set([...v, s])]);
    setInside(true);
    window.location.assign(`#ci/${s}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => heading.current?.focus());
  }
  function leave() {
    setInside(false);
    window.location.assign('#map');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function complete(s: number) {
    let next = [...new Set([...done, s])];
    try {
      next = [
        ...new Set([...readProgress(localStorage.getItem(STORAGE)), ...next]),
      ];
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      setStorageMessage('探索標記暫時無法保存；主要操作不受影響。');
    }
    setDone(next);
  }
  return (
    <>
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>
      <header className="site-header">
        <button className="brand" onClick={leave}>
          <Grid2X2 size={24} />
          <span>韻文時空館</span>
        </button>
        <span className="header-note">國中國文 · 互動探索</span>
        <span className="tag">
          {done.length === 10 ? '詞館探索完成 ✓' : '首站開放：詞館'}
        </span>
      </header>
      <main
        id="main-content"
        className={inside ? 'dive' : 'zoom-out'}
        key={inside ? 'inside' : 'outside'}
      >
        {inside ? (
          <SidebarProvider className="museum-layout">
            <Sidebar collapsible="none" className="museum-sidebar">
              <Button className="back-map" variant="ghost" onClick={leave}>
                <Map /> 返回時間圖
              </Button>
              <p className="panel-kicker">你在這裡 · 詞館</p>
              <div className="mini-timeline" aria-label="韻文歷史定位">
                {halls.map((h) => (
                  <span key={h.name} className={h.name === '詞' ? 'here' : ''}>
                    <small>{h.era}</small>
                    {h.name === '詞' ? '● ' : ''}
                    {h.name}
                  </span>
                ))}
              </div>
              <nav aria-label="詞館知識路徑" className="knowledge-nav">
                {stages.map((s, i) => (
                  <button
                    key={s.short}
                    aria-current={stage === i ? 'step' : undefined}
                    onClick={() => go(i)}
                    className={`${stage === i ? 'current' : ''} ${done.includes(i) ? 'explored' : ''}`}
                  >
                    <span>
                      {done.includes(i) ? (
                        <Check size={15} />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    {s.short}
                  </button>
                ))}
              </nav>
              <div className="exploration-progress">
                <Progress value={done.length * 10}>
                  <ProgressLabel>已探索 {done.length} / 10 站</ProgressLabel>
                </Progress>
                <p>
                  探索標記保存在這台裝置。
                  <br />
                  每次重新開啟可再次操作。
                </p>
              </div>
            </Sidebar>
            <div className="gallery-main">
              <div className="breadcrumbs">
                <button onClick={leave}>韻文時空館</button>
                <span>／</span>
                <span>詞</span>
                <span>／</span>
                <strong>{stages[stage].short}</strong>
              </div>
              <header className="activity-heading">
                <p className="eyebrow">
                  {stage === 9
                    ? '最終任務'
                    : `探索 ${String(stage + 1).padStart(2, '0')}`}{' '}
                  <span>操作 → 觀察 → 發現</span>
                </p>
                <h1 ref={heading} tabIndex={-1}>
                  {stages[stage].title}
                </h1>
                <p>{stages[stage].question}</p>
              </header>
              <div key={resetKey}>
                {visited.map((i) => {
                  const Activity = activities[i];
                  return (
                    <section
                      hidden={i !== stage}
                      key={i}
                      className="activity"
                      aria-label={stages[i].short}
                    >
                      <Activity onDone={() => complete(i)} />
                    </section>
                  );
                })}
              </div>
              <footer className="activity-footer">
                <div>
                  <span className="panel-kicker">
                    {done.includes(stage) ? '這一站已探索 ✓' : '先動手，再前進'}
                  </span>
                  <p>
                    {done.includes(stage)
                      ? stages[stage].bridge
                      : '完成本關操作後，下一站就會亮起。'}
                  </p>
                </div>
                <div className="actions">
                  {stage > 0 && (
                    <Button variant="outline" onClick={() => go(stage - 1)}>
                      <MoveLeft /> 上一站
                    </Button>
                  )}
                  {stage < 9 ? (
                    <Button
                      disabled={!done.includes(stage)}
                      onClick={() => go(stage + 1)}
                    >
                      下一站 <ArrowRight />
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={leave}>
                      回到時間圖 <Map />
                    </Button>
                  )}
                </div>
              </footer>
              {storageMessage && <output>{storageMessage}</output>}
              <details className="teacher-notes">
                <summary>教材來源與課堂使用說明</summary>
                <p>
                  本版以句長模具理解詞牌；不把字數符合當成完整格律認證。字數採企劃指定分類：小令
                  58 字以內、中調 59～90 字、長調 91 字以上。
                </p>
                <p>
                  待教師確認：〈蝶戀花〉與〈卜算子〉的課本異文、題名呈現；「曲子詞」「倚聲」是否符合本次指定版本。自主解釋由教師討論，不做自動語意評分。
                </p>
                <ul>
                  {sources.map((s) => (
                    <li key={s.label}>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
                <p>
                  古典正文屬公有領域；教學擬作均有標示。沒有使用現代歌曲原歌詞或錄音。
                </p>
                <Button
                  variant="outline"
                  onClick={() => setResetAsk(!resetAsk)}
                >
                  <RotateCcw /> 重新開始本機探索
                </Button>
                {resetAsk && (
                  <div className="reset-confirm">
                    <p>這會清除這台裝置的詞館探索標記與本次操作。</p>
                    <Button
                      onClick={() => {
                        setDone([]);
                        try {
                          localStorage.removeItem(STORAGE);
                        } catch {
                          /* Private browsing still supports in-memory reset. */
                        }
                        setVisited([0]);
                        setResetKey((k) => k + 1);
                        setResetAsk(false);
                        go(0);
                      }}
                    >
                      確定重新開始
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setResetAsk(false)}
                    >
                      保留進度
                    </Button>
                  </div>
                )}
              </details>
            </div>
          </SidebarProvider>
        ) : (
          <div className="home">
            <div className="intro">
              <div>
                <p className="eyebrow">六種文體，一張探索地圖</p>
                <h1>
                  穿過時間，
                  <br />
                  看見文字的形狀。
                </h1>
              </div>
              <p className="intro-aside">
                從整張地圖出發，走進一座展館。
                <br />
                動手拆解、填入、比較，
                <br />
                發現藏在文字背後的規則。
              </p>
            </div>
            <section className="time-map" aria-label="完整韻文時間圖">
              <div className="map-label">
                <span>韻文時間圖</span>
                <span>歷史定位 →</span>
              </div>
              <div className="hall-grid">
                {halls.map((h, i) => (
                  <article
                    key={h.name}
                    className={`hall ${i === 4 ? 'active' : ''}`}
                  >
                    <span className="era">{h.era}</span>
                    <div className="node">
                      <span className="hall-number">0{i + 1}</span>
                      <h2>{h.name}</h2>
                      <div className="mini-shape" aria-hidden="true">
                        {h.shape.map((n, k) => (
                          <div key={k}>
                            {Array.from({ length: n }, (_, j) => (
                              <i key={j} />
                            ))}
                          </div>
                        ))}
                      </div>
                      <p>{h.note}</p>
                      {i === 4 ? (
                        <Button
                          className="enter"
                          onClick={() =>
                            go(
                              stages.findIndex((_, j) => !done.includes(j)) ===
                                -1
                                ? 9
                                : stages.findIndex((_, j) => !done.includes(j)),
                            )
                          }
                        >
                          {done.length === 10
                            ? '再訪詞館'
                            : done.length > 0
                              ? '繼續探索'
                              : '進入詞館'}{' '}
                          <ArrowUpRight />
                        </Button>
                      ) : (
                        <span className="soon">即將開放</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <p className="map-foot">
                依代表性發展時期定位；各文體可並存，並非前一種消失後才有下一種。
              </p>
            </section>
            <div className="map-bottom">
              <p>
                <span className="relation-line" />{' '}
                文體關係另看：詞與曲都有牌名與音樂格式的概念。
                <br />
                <span className="quiet">
                  文字格僅示意外觀，不代表各文體只有一種格式。
                </span>
              </p>
              <p>
                本次探索 <strong>詞館 · 長短句與詞牌</strong>
                <span>
                  {done.length
                    ? `已探索 ${done.length} / 10 站`
                    : '不需登入，從操作開始。'}
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
