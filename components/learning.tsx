'use client';
import { useState } from 'react';
import { Check, ArrowRight, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCardDrag } from '@/hooks/use-card-drag';
import {
  works,
  formatScope,
  molds,
  samples,
  aliases,
  roleHints,
  finalCandidates,
  type Work,
} from '@/data/curriculum';
import {
  characters,
  countWords,
  classify,
  matches,
  slotFeedback,
} from '@/lib/learning';
type Done = { onDone: () => void };
export function Feedback({
  children,
  good = false,
}: {
  children: React.ReactNode;
  good?: boolean;
}) {
  return (
    <output className={`feedback ${good ? 'good' : ''}`} aria-live="polite">
      {children}
    </output>
  );
}
export function Cells({
  text = '',
  length,
  empty = false,
}: {
  text?: string;
  length?: number;
  empty?: boolean;
}) {
  return (
    <span
      className="cells"
      aria-label={empty ? `${length ?? text.length} 個空格` : text}
    >
      {Array.from({ length: length ?? characters(text).length }, (_, i) => (
        <span className="cell" aria-hidden="true" key={i}>
          {empty ? '' : characters(text)[i]}
        </span>
      ))}
    </span>
  );
}
export function Source({ work }: { work: Work }) {
  return (
    <p className="source">
      {work.author} · 〈{work.tune}〉
      {work.title ? ` · ${work.title}` : `（首句：${work.lines[0]}）`}{' '}
      <a href={work.source} target="_blank" rel="noreferrer">
        原文來源 ↗
      </a>
    </p>
  );
}
function DoneNote({ children }: { children: React.ReactNode }) {
  return (
    <Feedback good>
      <Check size={20} />
      <span>{children}</span>
    </Feedback>
  );
}
export function Shapes({ onDone }: Done) {
  const [seen, setSeen] = useState<string[]>([]);
  const [named, setNamed] = useState(false);
  const rows = [['□□□□□□□', '□□□□□□□', '□□□□□□□', '□□□□□□□'], works[0].lines];
  const reveal = (key: string) =>
    setSeen((s) => (s.includes(key) ? s : [...s, key]));
  return (
    <>
      <div className="two-col">
        <section className="panel">
          <span className="panel-kicker">文字外觀 A · 句長示意</span>
          <h3>一排又一排</h3>
          {rows[0].map((_, i) => (
            <button
              className="shape-line"
              key={i}
              onClick={() => reveal(`a${i}`)}
              aria-label={`展開 A 第 ${i + 1} 句`}
            >
              <Cells length={7} empty />
              {seen.includes(`a${i}`) ? <b>7 字</b> : <span>點開看字數</span>}
            </button>
          ))}
          <p className="quiet">只示意每句七字，不據此外型認證為近體詩。</p>
        </section>
        <section className="panel">
          <span className="panel-kicker">文字外觀 B · 李清照作品</span>
          <h3>把每句變成格子</h3>
          {rows[1].map((line, i) => (
            <button
              className="shape-line"
              key={i}
              onClick={() => reveal(`b${i}`)}
              aria-label={`展開 B 第 ${i + 1} 句`}
            >
              {seen.includes(`b${i}`) ? (
                <>
                  <Cells text={line} />
                  <b>{line.length} 字</b>
                </>
              ) : (
                <span className="poem-text">{line}</span>
              )}
            </button>
          ))}
        </section>
      </div>
      {seen.length === 11 ? (
        <>
          <Button
            className="action"
            onClick={() => {
              setNamed(true);
              onDone();
            }}
          >
            替 B 的句子形狀命名 <ArrowRight />
          </Button>
          {named && (
            <DoneNote>
              <strong>長短句。</strong>這首詞有 6 字、5 字、2
              字句；詞的句子大多長短不齊，所以有這個別稱。
            </DoneNote>
          )}
        </>
      ) : (
        <p className="instruction">
          已觀察 {seen.length} / 11 句。點完兩組的每一句，再把發現命名。
        </p>
      )}
    </>
  );
}
export function Assembly({
  work,
  onComplete,
  conceal = false,
}: {
  work: Work;
  onComplete: () => void;
  conceal?: boolean;
}) {
  const [filled, setFilled] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState(
    '先點選一句，再點文字槽。右下方可以展開原文核對位置。',
  );
  const order = [3, 0, 6, 2, 5, 1, 4];
  const drag = useCardDrag(setSelected, put);
  function put(slot: number, card = selected) {
    if (card === null) {
      setMessage('先選一張詞句卡，再點這個文字槽。');
      return;
    }
    if (filled.includes(slot)) {
      setMessage('這個位置已經填好；試試其他空槽。');
      return;
    }
    const error = slotFeedback(work.lines[card], work.lines[slot], slot);
    if (error) {
      setMessage(error);
      return;
    }
    const next = [...filled, slot];
    setFilled(next);
    setSelected(null);
    setMessage(
      `第 ${slot + 1} 句嵌入了 ${work.lines[slot].length} 格。${next.length === 7 ? '整首的句長與位置已核對完成。' : '繼續觀察其他空槽。'}`,
    );
    if (next.length === work.lines.length) onComplete();
  }
  return (
    <>
      <div className="workshop">
        <section className="mold">
          <div className="mold-head">
            <span>{conceal ? '只留下格式' : '固定文字槽'}</span>
            <span>
              {filled.length} / {work.lines.length} 句
            </span>
          </div>
          {work.lines.map((line, i) => (
            <button
              key={i}
              className={`slot ${filled.includes(i) ? 'filled' : ''}`}
              aria-label={`第 ${i + 1} 槽，${line.length} 字${filled.includes(i) ? '，已填入' : ''}`}
              {...drag.zoneProps(i)}
              onClick={() => put(i)}
            >
              <span className="slot-index">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Cells
                text={filled.includes(i) ? line : ''}
                length={line.length}
                empty={conceal || !filled.includes(i)}
              />
              <span className="slot-count">{line.length} 字</span>
            </button>
          ))}
        </section>
        <section className="card-tray">
          <span className="panel-kicker">詞句卡片 · {work.topic}</span>
          <p className="quiet">選卡 → 點槽，或拖曳放入</p>
          {order.map((i) => (
            <button
              {...drag.cardProps(i)}
              className={`word-card ${selected === i ? 'selected' : ''}`}
              aria-pressed={selected === i}
              disabled={filled.includes(i)}
              key={i}
            >
              {work.lines[i]}
              <span>
                {filled.includes(i) ? '已放入' : `${work.lines[i].length} 字`}
              </span>
            </button>
          ))}
          <details>
            <summary>查看原作順序</summary>
            <p>{work.lines.join('，')}。</p>
          </details>
        </section>
      </div>
      <Feedback good={filled.length === 7}>{message}</Feedback>
      <Source work={work} />
      <p className="scope">{formatScope}</p>
    </>
  );
}
export function HiddenMold({ onDone }: Done) {
  const [full, setFull] = useState(false);
  const [empty, setEmpty] = useState(false);
  return (
    <>
      <Assembly
        work={works[0]}
        onComplete={() => setFull(true)}
        conceal={empty}
      />
      {full && (
        <Button
          className="action"
          onClick={() => {
            setEmpty(true);
            onDone();
          }}
        >
          把文字拿走，看看留下什麼
        </Button>
      )}
      {empty && (
        <DoneNote>
          文字消失了，6・6・5・6・2・2・6 的形狀仍然存在。長短句也要依循格式。
        </DoneNote>
      )}
    </>
  );
}
export function Refill({ onDone }: Done) {
  const [round, setRound] = useState(1);
  const [filled, setFilled] = useState(false);
  const [compare, setCompare] = useState(false);
  const [found, setFound] = useState(false);
  return (
    <>
      <p className="concept-strip">
        <strong>詞牌：如夢令</strong>
        <span>這就是上一關那副可重複使用的模具。</span>
      </p>
      {!compare ? (
        <>
          <div className="rounds">
            {works.slice(0, 3).map((w, i) => (
              <span className={i <= round ? 'lit' : ''} key={w.id}>
                {i < round ? '✓ ' : ''}第 {i + 1} 首 · {w.author}
              </span>
            ))}
          </div>
          <Assembly
            key={round}
            work={works[round]}
            onComplete={() => setFilled(true)}
          />
          {filled && (
            <Button
              className="action"
              onClick={() => {
                if (round === 1) {
                  setRound(2);
                  setFilled(false);
                } else setCompare(true);
              }}
            >
              {round === 1 ? '再填一首：換個作者' : '把三首作品並排比較'}{' '}
              <ArrowRight />
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="compare-works">
            {works.slice(0, 3).map((w) => (
              <section className="panel compact" key={w.id}>
                <h3>{w.author}</h3>
                <p className="quiet">{w.topic}</p>
                {w.lines.map((line, i) => (
                  <div key={i}>
                    <Cells text={line} />
                  </div>
                ))}
              </section>
            ))}
          </div>
          <p className="instruction">
            三首作品的文字、題材，甚至作者都換了。點一下始終沒有改變的東西。
          </p>
          <button
            className="shared-mold"
            onClick={() => {
              setFound(true);
              onDone();
            }}
          >
            <strong>三首共用的詞牌模具</strong>
            <span>6 ┃ 6 ┃ 5 ┃ 6 ┃ 2 ┃ 2 ┃ 6</span>
          </button>
          {found && (
            <DoneNote>
              詞牌規定填詞時依循的基本格式。同一副「蘿蔔坑」，可以填進不同內容；〈如夢令〉也不一定寫夢。
            </DoneNote>
          )}
        </>
      )}
    </>
  );
}
export function NameEvidence({ onDone }: Done) {
  const [opened, setOpened] = useState<number[]>([]);
  const [split, setSplit] = useState(false);
  const evidence = [
    {
      quote: '燈火錢塘三五夜',
      explain: '「三五夜」指元宵夜，寫的是錢塘的燈火。',
    },
    { quote: '寂寞山城人老也', explain: '轉向山城的寂寞與自己的感受。' },
    { quote: '火冷燈稀霜露下', explain: '描寫燈火稀疏、霜露降下的景象。' },
  ];
  return (
    <>
      <div className={`name-content ${split ? 'separated' : ''}`}>
        <section className="name-sign">
          <span>詞牌名稱</span>
          <h2>蝶戀花</h2>
          <p aria-label="蝴蝶、愛心、花">🦋　♡　✿</p>
          <span>名字讓你想到什麼？</span>
        </section>
        <section className="panel">
          <span className="panel-kicker">正文證據 · 蘇軾〈密州上元〉</span>
          {evidence.map((e, i) => (
            <button
              key={i}
              className="evidence"
              onClick={() => setOpened((s) => (s.includes(i) ? s : [...s, i]))}
            >
              <strong>{e.quote}</strong>
              <span>
                {opened.includes(i) ? e.explain : '點開這句的線索 ＋'}
              </span>
            </button>
          ))}
        </section>
      </div>
      {opened.length === 3 && (
        <Button
          className="action"
          onClick={() => {
            setSplit(true);
            onDone();
          }}
        >
          把牌名與內容分開 <ArrowRight />
        </Button>
      )}
      {split && (
        <DoneNote>
          這首〈蝶戀花〉寫元宵景象與感懷，不必寫蝴蝶或花。詞牌名稱與作品內容沒有必然關係。
        </DoneNote>
      )}
      <Source work={works[3]} />
    </>
  );
}
export function FormatLab({ onDone }: Done) {
  const [selected, setSelected] = useState<number | null>(null);
  const [passed, setPassed] = useState<number[]>([]);
  const [trap, setTrap] = useState(false);
  const [message, setMessage] = useState(
    '請先把「蝴蝶與花」放進〈蝶戀花〉試試，再讓三組文字各自找到句長相合的模具。',
  );
  function test(m: number) {
    if (selected === null) {
      setMessage('先選一組文字，再來試模具。');
      return;
    }
    const s = samples[selected];
    if (selected === 2 && m === 1) setTrap(true);
    if (matches(s.lines, molds[m].shape)) {
      const next = [...new Set([...passed, selected])];
      setPassed(next);
      setMessage(
        `「${s.title}」通過這個三分句的句長檢查。題材不是檢查標準；這不等於完整詞作格律認證。`,
      );
      if (next.length === 3 && trap) onDone();
    } else {
      const i = s.lines.findIndex(
        (line, j) => line.length !== molds[m].shape[j],
      );
      setMessage(
        `「${s.title}」第 ${i + 1} 個分句有 ${s.lines[i].length} 字，這副模具要 ${molds[m].shape[i]} 字。即使題材像牌名，也不能忽略格式。`,
      );
      if (selected === 2 && m === 1 && passed.length === 3) onDone();
    }
  }
  return (
    <>
      <div className="three-col">
        {samples.map((s, i) => (
          <button
            className={`sample panel ${selected === i ? 'selected' : ''}`}
            key={s.title}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span className="panel-kicker">
              {s.kind} · {passed.includes(i) ? '句長已配對 ✓' : '待檢驗'}
            </span>
            <h3>{s.title}</h3>
            {s.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </button>
        ))}
      </div>
      <div className="three-col mold-options">
        {molds.map((m, i) => (
          <button
            className="mold mini-mold"
            key={m.name}
            onClick={() => test(i)}
            aria-label={`試填${m.name}`}
          >
            <h3>{m.name}</h3>
            {m.shape.map((n, j) => (
              <div key={j}>
                <Cells length={n} empty />
                <span>{n} 字</span>
              </div>
            ))}
          </button>
        ))}
      </div>
      <Feedback good={passed.length === 3 && trap}>{message}</Feedback>
      <p className="quiet">
        句長配對 {passed.length} / 3 · 牌名陷阱 {trap ? '已觀察 ✓' : '尚未試填'}
        。僅展示各牌的一種體式開頭三個分句；擬作不宣稱符合平仄押韻。
      </p>
    </>
  );
}
export function RoleSort({ work, onDone }: { work: Work } & Done) {
  const cards = [
    work.lines.join('，') + '。',
    work.tune,
    work.title ?? '未另題名',
  ];
  const expected = [1, 2, 0];
  const [selected, setSelected] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Record<number, number>>({});
  const [message, setMessage] = useState(
    '把三張卡分別放到「詞牌」「題目」「正文」。',
  );
  const drag = useCardDrag(setSelected, put);
  function put(zone: number, card = selected) {
    if (card === null) {
      setMessage('先點一張資訊卡。');
      return;
    }
    if (card !== expected[zone]) {
      setMessage(
        `這裡是${['詞牌', '題目', '正文'][zone]}：${roleHints[zone]} 再想想這張卡是在指定格式、替作品題名，還是填入文字。`,
      );
      return;
    }
    const next = { ...assigned, [zone]: card };
    setAssigned(next);
    setSelected(null);
    setMessage(`${['詞牌', '題目', '正文'][zone]}歸位了：${roleHints[zone]}`);
    if (Object.keys(next).length === 3) onDone();
  }
  return (
    <>
      <div className="role-cards">
        {cards.map((card, i) => (
          <button
            className={`word-card ${selected === i ? 'selected' : ''}`}
            key={i}
            disabled={Object.values(assigned).includes(i)}
            aria-pressed={selected === i}
            {...drag.cardProps(i)}
          >
            {card}
          </button>
        ))}
      </div>
      <div className="three-col">
        {roleHints.map((hint, i) => (
          <button
            className="role-zone"
            key={hint}
            {...drag.zoneProps(i)}
            onClick={() => put(i)}
          >
            <span className="panel-kicker">{['詞牌', '題目', '正文'][i]}</span>
            <p>{hint}</p>
            <strong>
              {assigned[i] !== undefined ? cards[assigned[i]] : '＋ 放入資訊卡'}
            </strong>
          </button>
        ))}
      </div>
      <Feedback good={Object.keys(assigned).length === 3}>{message}</Feedback>
      <Source work={work} />
      <p className="scope">
        有些詞沒有另立題目；用首句辨識作品時，首句仍是正文，不會自動變成作者所題的題目。
      </p>
    </>
  );
}
export function MusicBridge({ onDone }: Done) {
  const [filled, setFilled] = useState(false);
  const [morphed, setMorphed] = useState(false);
  const [message, setMessage] = useState(
    '先有一小段旋律，再試著放入一句文字。',
  );
  return (
    <>
      <div className={`music-bridge ${morphed ? 'ancient' : ''}`}>
        <Music2 size={38} />
        <span className="panel-kicker">
          {morphed ? '回到古代詞的模型' : '生活鷹架 · 熟悉的〈小星星〉'}
        </span>
        <h2>{morphed ? '詞牌／曲調的既定格式' : '一個音，先試放一個字'}</h2>
        <div className="notes">
          {(morphed
            ? ['6', '6', '5', '6', '2', '2', '6']
            : ['1', '1', '5', '5', '6', '6', '5']
          ).map((n, i) => (
            <span key={i}>{n}</span>
          ))}
        </div>
        {morphed ? (
          <p>依詞牌／曲調格式 → 填入文字 → 一首詞</p>
        ) : (
          <Cells
            text={filled ? '放學一起看星星' : ''}
            length={7}
            empty={!filled}
          />
        )}
      </div>
      {!morphed && (
        <div className="actions">
          <Button
            variant="outline"
            onClick={() =>
              setMessage(
                '這句有 8 字，但這次示意只有 7 個一字一音的位置。先比對位置，再試另一句；真實歌曲並非永遠一字一音。',
              )
            }
          >
            試填：放學我們一起看星
          </Button>
          <Button
            onClick={() => {
              setFilled(true);
              setMessage(
                '7 個字對上 7 個位置。文字由你換，既有的旋律位置保留下來。',
              );
            }}
          >
            試填：放學一起看星星
          </Button>
        </div>
      )}
      <Feedback good={filled}>{message}</Feedback>
      {filled && !morphed && (
        <Button
          className="action"
          onClick={() => {
            setMorphed(true);
            onDone();
          }}
        >
          把生活例子轉回古代詞 <ArrowRight />
        </Button>
      )}
      {morphed && (
        <DoneNote>
          詞原與音樂密切相關，依既定曲調格式寫作，稱為「填詞」或「倚聲」。詞在唐五代發展，到了宋代尤其興盛。
        </DoneNote>
      )}
      <p className="scope">
        兩句文字皆為教學擬作，不是〈小星星〉原歌詞。數字只示意熟悉旋律的開頭；一字一音是本關簡化操作，不是現代歌曲或古代詞的完整定義。
      </p>
    </>
  );
}
const categories = ['小令', '中調', '長調'];
export function Measure({ onDone }: Done) {
  const examples = [works[0], works[3], works[4]];
  const [current, setCurrent] = useState(0);
  const [counted, setCounted] = useState<Record<string, number[]>>({});
  const [sorted, setSorted] = useState<string[]>([]);
  const [message, setMessage] = useState(
    '點每一行正文，把字數加進尺上；不計標點、詞牌、題目與小序。',
  );
  const w = examples[current];
  const seen = counted[w.id] ?? [];
  const total = seen.reduce((s, i) => s + w.lines[i].length, 0);
  function sort(category: string) {
    if (seen.length !== w.lines.length) {
      setMessage(
        `還有 ${w.lines.length - seen.length} 句未計數。分類前要量整首正文，不能只量前半首。`,
      );
      return;
    }
    if (classify(total) !== category) {
      setMessage(
        `你量到 ${total} 字。請對照 58／59 與 90／91 的界線，再放一次。`,
      );
      return;
    }
    const next = [...new Set([...sorted, w.id])];
    setSorted(next);
    setMessage(
      `${total} 字的〈${w.tune}〉歸入${category}。這是本課採用的國中教材常用字數分類。`,
    );
    if (next.length === 3) onDone();
  }
  return (
    <>
      <div className="actions">
        {examples.map((x, i) => (
          <Button
            variant={i === current ? 'default' : 'outline'}
            key={x.id}
            onClick={() => {
              setCurrent(i);
              setMessage('點每一行正文，累計這一首的字數，再放入分類區。');
            }}
          >
            〈{x.tune}〉 {sorted.includes(x.id) ? '✓' : ''}
          </Button>
        ))}
      </div>
      <div className="measure-layout">
        <section className="panel count-poem">
          <h3>逐句累計</h3>
          {w.lines.map((line, i) => (
            <button
              key={i}
              className={`count-line ${seen.includes(i) ? 'counted' : ''}`}
              onClick={() =>
                setCounted((s) => ({
                  ...s,
                  [w.id]: [...new Set([...(s[w.id] ?? []), i])],
                }))
              }
            >
              {line}
              <b>{seen.includes(i) ? `＋${line.length}` : '＋'}</b>
            </button>
          ))}
        </section>
        <section className="panel ruler-panel">
          <span className="panel-kicker">正文總字數</span>
          <p className="big-count">
            {total}
            <small> 字</small>
          </p>
          <div className="ruler">
            <div style={{ width: `${Math.min((total / 100) * 100, 100)}%` }} />
            <span className="tick t58">58</span>
            <span className="tick t90">90</span>
          </div>
          <div className="category-zones">
            {categories.map((c, i) => (
              <button key={c} onClick={() => sort(c)}>
                <strong>放入{c}</strong>
                <span>{['58 字以內', '59～90 字', '91 字以上'][i]}</span>
              </button>
            ))}
          </div>
          <p className="quiet">已分類 {sorted.length} / 3 首</p>
        </section>
      </div>
      <Feedback good={sorted.includes(w.id)}>{message}</Feedback>
      <Source work={w} />
    </>
  );
}
export function AliasMatch({ onDone }: Done) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [message, setMessage] = useState(
    '名稱不只是要背的字，把它放回你剛才做過的事。',
  );
  return (
    <>
      <div className="actions">
        {[2, 0, 1].map((i) => (
          <Button
            key={i}
            variant={selected === i ? 'default' : 'outline'}
            disabled={done.includes(i)}
            onClick={() => setSelected(i)}
          >
            {aliases[i].name}
            {done.includes(i) ? ' ✓' : ''}
          </Button>
        ))}
      </div>
      <div className="alias-list">
        {aliases.map((a, i) => (
          <button
            className="panel"
            key={a.name}
            onClick={() => {
              if (selected === null) {
                setMessage('先選一張名稱卡。');
                return;
              }
              if (selected !== i) {
                setMessage(
                  '這個名稱的線索不在這裡：先分辨你觀察的是句子形狀、音樂背景，還是依聲填寫的動作。',
                );
                return;
              }
              const next = [...new Set([...done, i])];
              setDone(next);
              setSelected(null);
              setMessage(a.feedback);
              if (next.length === 3) onDone();
            }}
          >
            <span>{a.experience}</span>
            <strong>{done.includes(i) ? a.name : '＋ 貼上名稱'}</strong>
          </button>
        ))}
      </div>
      <Feedback good={done.length === 3}>{message}</Feedback>
      <p className="concept-strip">
        詞的名片：唐五代發展 · 宋代興盛 · 與音樂密切相關
      </p>
    </>
  );
}
function FinalNameTrap({ onDone }: Done) {
  const [selected, setSelected] = useState<number | null>(null);
  const [tried, setTried] = useState<number[]>([]);
  const [placed, setPlaced] = useState(false);
  const [message, setMessage] = useState(
    '兩組文字都試一次。用句長檢驗〈卜算子〉上片，不靠「卜」字猜題材。',
  );
  return (
    <>
      <div className="two-col">
        {finalCandidates.map((c, i) => (
          <button
            className={`panel sample ${selected === i ? 'selected' : ''}`}
            key={c.label}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
          >
            <span className="panel-kicker">
              {c.kind} {tried.includes(i) ? '· 已檢驗' : ''}
            </span>
            <h3>{c.label}</h3>
            {c.lines.map((line, j) => (
              <div key={j}>{line}</div>
            ))}
          </button>
        ))}
      </div>
      <button
        className="mold final-trap-mold"
        onClick={() => {
          if (selected === null) {
            setMessage('先選一組文字，再放入模具。');
            return;
          }
          const success = matches(
            finalCandidates[selected].lines,
            [5, 5, 7, 5],
          );
          setPlaced(success);
          const next = [...new Set([...tried, selected])];
          setTried(next);
          setMessage(finalCandidates[selected].feedback);
          if (next.length === 2) onDone();
        }}
      >
        <h3>放入〈卜算子〉上片模具</h3>
        {[5, 5, 7, 5].map((n, i) => (
          <div key={i}>
            <Cells
              length={n}
              text={placed ? works[5].lines[i] : ''}
              empty={!placed}
            />
            <span>{n} 字</span>
          </div>
        ))}
      </button>
      <Feedback good={tried.length === 2}>{message}</Feedback>
    </>
  );
}
export function FinalMission({ onDone }: Done) {
  const w = works[5];
  const [phase, setPhase] = useState(0);
  const [template, setTemplate] = useState(false);
  const [trap, setTrap] = useState(false);
  const [roles, setRoles] = useState(false);
  const [observed, setObserved] = useState<number[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [height, setHeight] = useState(false);
  const [reason, setReason] = useState('');
  const [reflection, setReflection] = useState('');
  const [certificate, setCertificate] = useState(false);
  const [message, setMessage] = useState(
    '點開正文每句的字數，再選一副句長符合的模具。',
  );
  const shapes = [
    [5, 5, 5, 5, 5, 5, 5, 5],
    [5, 5, 7, 5, 5, 5, 7, 5],
    [6, 6, 5, 6, 2, 2, 6],
  ];
  const all = template && trap && roles && height;
  return (
    <>
      <div className="final-steps">
        {['挑模具', '牌名陷阱', '拆作品', '量身高', '鑑定書'].map((s, i) => (
          <Button
            variant={phase === i ? 'default' : 'outline'}
            key={s}
            onClick={() => {
              setPhase(i);
              setMessage('');
            }}
          >
            {i + 1}. {s}{' '}
            {[template, trap, roles, height, certificate][i] ? '✓' : ''}
          </Button>
        ))}
      </div>
      {phase === 0 && (
        <>
          <div className="two-col">
            <section className="panel">
              <h3>陌生作品 · 正文</h3>
              {w.lines.map((line, i) => (
                <button
                  className="shape-line"
                  key={i}
                  onClick={() => setObserved((s) => [...new Set([...s, i])])}
                >
                  {observed.includes(i) ? (
                    <>
                      <Cells text={line} />
                      <b>{line.length} 字</b>
                    </>
                  ) : (
                    line
                  )}
                </button>
              ))}
            </section>
            <section className="panel">
              <h3>哪一副能容納這首正文？</h3>
              {shapes.map((shape, i) => (
                <button
                  className="template-choice"
                  key={i}
                  onClick={() => {
                    if (observed.length < 8) {
                      setMessage('請先觀察完 8 句，收集整首的句長證據。');
                      return;
                    }
                    if (matches(w.lines, shape)) {
                      setTemplate(true);
                      setMessage(
                        '每句都核對成功：這是本作品〈卜算子〉的句長模具。仍不等於只憑字數就能判定完整格律。',
                      );
                    } else
                      setMessage(
                        `模具 ${['甲', '乙', '丙'][i]}${shape.length !== 8 ? '的句數不同' : '的第 3、7 句只有 5 格，正文各有 7 字'}；請逐句核對，不要只看第一句。`,
                      );
                  }}
                >
                  <strong>模具{['甲', '乙', '丙'][i]}</strong>
                  <span>{shape.join(' · ')}</span>
                </button>
              ))}
            </section>
          </div>
        </>
      )}
      {phase === 1 && <FinalNameTrap onDone={() => setTrap(true)} />}
      {phase === 2 && <RoleSort work={w} onDone={() => setRoles(true)} />}
      {phase === 3 && (
        <>
          <div className="panel">
            <h3>只數正文，不數題名</h3>
            <div className="final-count">
              {w.lines.map((line, i) => (
                <span key={i}>
                  {line}
                  <small>（{line.length} 字）</small>
                </span>
              ))}
            </div>
            <label className="field">
              正文共有幾字？
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="200"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setHeight(false);
                }}
              />
            </label>
            <div className="actions">
              {categories.map((c) => (
                <Button
                  variant={category === c ? 'default' : 'outline'}
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setHeight(false);
                  }}
                >
                  {c}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => {
                if (Number(amount) !== countWords(w.lines)) {
                  setMessage(
                    '把 5＋5＋7＋5 的兩組相加；詞牌、題目和標點不算正文。',
                  );
                  return;
                }
                if (category !== classify(Number(amount))) {
                  setMessage(
                    '你已數對 44 字。請用「58 字以內」這條界線選分類。',
                  );
                  return;
                }
                setHeight(true);
                setMessage('44 字，屬於小令。你用整首正文的字數完成了分類。');
              }}
            >
              檢驗字數與分類
            </Button>
          </div>
        </>
      )}
      {phase === 4 && (
        <section className="panel certificate">
          <span className="panel-kicker">詞作品鑑定書</span>
          <h2>〈卜算子〉</h2>
          <p>
            {w.title} · {w.author}
          </p>
          <div className="report-grid">
            <p>
              句長觀察{' '}
              <strong>{template ? '5・5・7・5，重複兩組' : '待完成'}</strong>
            </p>
            <p>
              牌名與內容{' '}
              <strong>{trap ? '不必寫占卜；以正文為證' : '待完成'}</strong>
            </p>
            <p>
              三種角色{' '}
              <strong>{roles ? '詞牌、題目、正文已拆解' : '待完成'}</strong>
            </p>
            <p>
              字數分類 <strong>{height ? '44 字 · 小令' : '待完成'}</strong>
            </p>
          </div>
          <label className="field">
            用自己的話說：這首詞為什麼能叫「長短句」？
            <textarea
              value={reason}
              maxLength={500}
              onChange={(e) => {
                setReason(e.target.value);
                setCertificate(false);
              }}
              placeholder="試著引用你量到的句長。"
            />
          </label>
          <label className="field">
            「填詞」時，什麼可以更換？什麼要依循？
            <textarea
              value={reflection}
              maxLength={500}
              onChange={(e) => {
                setReflection(e.target.value);
                setCertificate(false);
              }}
              placeholder="想起三首詞共用同一副模具的操作。"
            />
          </label>
          <p className="quiet">
            開放回答保留你的說法，交由教師討論，不以關鍵字自動判定理解正確。
          </p>
          <Button
            disabled={!all}
            onClick={() => {
              if (reason.trim().length < 6 || reflection.trim().length < 6) {
                setMessage(
                  '請在兩個欄位各留下一句至少 6 字的說明，讓老師看見你的推理。',
                );
                return;
              }
              setCertificate(true);
              onDone();
              setMessage(
                '鑑定書已完成。四項操作檢核通過；兩段自主解釋請和老師或同學討論。',
              );
            }}
          >
            完成鑑定書 <Check />
          </Button>
          {!all && (
            <p className="instruction">
              請先完成上方四項操作檢核，才能提交鑑定書。
            </p>
          )}
          {certificate && (
            <div className="completion">
              <Check size={40} />
              <h2>詞館探索完成</h2>
              <p>你已經有了自己的格式判斷工具。</p>
              <Button variant="outline" onClick={() => window.print()}>
                列印／儲存鑑定書
              </Button>
            </div>
          )}
        </section>
      )}
      {message && (
        <Feedback good={certificate || [template, trap, roles, height][phase]}>
          {message}
        </Feedback>
      )}
      {phase < 4 && (
        <Button
          className="action"
          onClick={() => {
            setPhase(phase + 1);
            setMessage('');
          }}
        >
          下一項鑑定 <ArrowRight />
        </Button>
      )}
      <Source work={w} />
    </>
  );
}
export const activities = [
  Shapes,
  HiddenMold,
  Refill,
  NameEvidence,
  FormatLab,
  (props: Done) => <RoleSort work={works[3]} {...props} />,
  MusicBridge,
  Measure,
  AliasMatch,
  FinalMission,
];
