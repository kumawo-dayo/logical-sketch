// JS getDay() order: 0=日,1=月,2=火,3=水,4=木,5=金,6=土
const JS_DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const ALL_METRICS = ['line', 'ellipse', 'proportion', 'balance']
const SCORE_LABELS = { line: '線の精度', ellipse: '楕円対称性', proportion: '形の再現率', balance: '全体バランス' }

export const WARMUP_BASE = '直線30本（水平・垂直・45°各10本）→ 楕円15個（直径2cm・5cm・8cm各5個）→ 正円9個（3サイズ各3個）※合計約10分'

const WEEK_DRILLS = {
  1: [
    {
      task: '直線精度ドリル：5mm間隔・約10cmの平行線を水平10本・垂直10本・45°10本（計30本）',
      warmup: '今日は直線の「腕の動き」を確認。1本目の前に「肘が支点、肩が動力」と声に出す',
      metrics: ['line', 'balance'],
      goal: '腕全体を使った均一な直線を習得し、5mm間隔の精度を定規で自己採点できるようにする',
      tips: [
        '肘を机から離さず、肩の動きで線を引く（手首は固定）',
        '1本引くごとに定規で間隔を確認して補正する（5±1mmが目標）',
        '始点と終点を先に点で印してから一気に引く（速く引くほどブレない）',
        '1秒以内で一気に引き切る。止まってやり直すほどブレが増える',
      ],
      successPattern: '30本の間隔差が均一、線の振れ幅が一定で弧にならない',
      failPattern: '手首が動いて弧が入る、止まってブレる、間隔が広がったり詰まったりする',
      duration: 35 * 60,
    },
    {
      task: '楕円精度ドリル：直径2cm・5cm・8cmを各10個（扁平率30%・60%・90%の3種）',
      warmup: '今日は楕円の「長軸の向き」を意識。ウォームアップで長軸を薄く引いてから楕円を描く練習',
      metrics: ['line', 'ellipse', 'proportion'],
      goal: '意図したサイズと扁平率の楕円を安定して描けるようにする',
      tips: [
        'まず長軸の線を薄く引き、短軸の長さを決めてから楕円を描く',
        '一筆目は薄く、2〜3回なぞって整える（一発仕上げは不要）',
        '描いた後に長軸を定規で引いて左右対称かチェックする',
        '同じ扁平率の10個を並べて見比べて一番整っているものを分析する',
      ],
      successPattern: '同じ設定の10個が揃って見える、長軸の向きが一定',
      failPattern: '10個がバラバラの形、長軸が毎回違う向き',
      duration: 35 * 60,
    },
    {
      task: '円柱基礎ドリル：高さ8cm・直径3cmの円柱を手順（中心軸→楕円軸→楕円→側線）で7個',
      warmup: '楕円の扁平率30〜40%の感覚をウォームアップで確認してから本題へ',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: '補助線→楕円→側線の正しい手順を体に覚えさせ、整合した円柱を描けるようにする',
      tips: [
        '手順：①中心の垂直軸 → ②上下の水平楕円軸（2本）→ ③楕円（上・下）→ ④側面の縦線2本',
        '上面楕円：扁平率35%（少し潰れている）、下面：45%（やや丸い）',
        '側面の縦線は楕円の左端・右端から垂直に下ろす（斜めにならない）',
        '7個完成後、最も完成度が高い1個を選んで何が良かったかメモする',
      ],
      successPattern: '上下楕円の向きが整合し、縦線が平行、高さと直径の比が概ね3:1',
      failPattern: '補助線を省いて直接描く、上下楕円の角度が違う、縦線が広がって台形になる',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を繰り返し練習（自動判定）',
      warmup: '週前半で最もミスが多かった動作を思い出し、それをウォームアップ開始から意識する',
      metrics: ALL_METRICS,
      goal: '週前半のフィードバックから特定した弱点を集中的に克服する',
      tips: [
        '前3日の「修正動作」欄を読み返し、共通の原因を1つ選ぶ',
        '同じ動作を20回繰り返し、前後をスマホで撮影して比較する',
        '「完璧」を目指さず「前回より1点改善」を目標にする',
        '弱点の動作だけを意識し、他の要素はいったん気にしない',
      ],
      successPattern: '指定した弱点の動作が週前半より明らかに改善している',
      failPattern: '同じ問題を繰り返しているのに気づかず続けている',
      duration: 35 * 60,
    },
  ],

  2: [
    {
      task: '1点透視ドリル：スマートフォン（150×75×8mm想定）を正面から1点透視で10個',
      warmup: '直線ウォームアップで「消失点に向かう収束感」を意識。10本目が1点に集まるよう意識する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '1点透視の基礎を製品スケッチに応用し、奥行きのある箱を正確に描けるようにする',
      tips: [
        '水平線（アイレベル）を先に引き、その上の1点に消失点を設定する',
        'スマートフォン正面（150×75の長方形）を先に描き、消失点へ向かう線を引く',
        '奥行き（8mm）は手前の幅（75mm）の10%程度の長さで表現する',
        '10個を描いて「最も自然に見えるもの」と「最もおかしいもの」を比較する',
      ],
      successPattern: '消失点への線が収束している、奥行きが薄く見える（実際に薄い製品）',
      failPattern: '消失点がずれて線が収束しない、奥行きが厚すぎて別の製品に見える',
      duration: 35 * 60,
    },
    {
      task: '2点透視ドリル：ハードカバー本（A5・厚さ3cm想定）を斜め45°から2点透視で8個',
      warmup: '直線ウォームアップで左右2方向に収束する線の感覚を練習する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '2点透視で本のような直方体を自然な角度で描けるようにする',
      tips: [
        '紙の左右端近くにVL・VRの2消失点を設定する（紙の外でもよい）',
        '手前の縦エッジ（本の背表紙の角）を最初に描き、左右の消失点へ線を引く',
        '縦線は常に垂直に保つ（2点透視で縦は曲がらない）',
        'A5の縦横比（21:15）を意識して、正面が縦長になるよう描く',
      ],
      successPattern: '縦線が垂直、2面が異なる消失点に収束、本らしい比率',
      failPattern: '縦線が斜め、2面が同じ向きに平行、本と全く違う比率',
      duration: 35 * 60,
    },
    {
      task: 'ラウンドコーナー直方体ドリル：スマートフォン型（角R=3mm想定）のラウンドコーナー箱を5個',
      warmup: '楕円ウォームアップで「小さい楕円の1/4」（コーナーの曲線）の感覚を練習する',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: '直線と小楕円を組み合わせてラウンドコーナー製品の基本フォームを描けるようにする',
      tips: [
        'まず角が直角の箱を描き、4隅の角を同サイズの楕円の1/4弧で置き換える',
        'コーナーの丸みは4隅で統一する（不統一は不安定に見える）',
        '側面のラウンドコーナーは正面より扁平に見える（透視効果）',
        '5個描いて丸みの大きさを比べ、最もスマートフォンらしいものを選ぶ',
      ],
      successPattern: '4隅の丸みが均一、直線と曲線がなめらかに接続',
      failPattern: 'コーナーの丸みが不統一、直線から曲線への移行がガタつく',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の「修正動作」を読み返し、ウォームアップでその動作を10回意識する',
      metrics: ALL_METRICS,
      goal: '透視描画の弱点を克服し、金曜の応用課題に備える',
      tips: [
        '透視が弱い場合：消失点を固定して、そこへ向かう線だけを20本練習する',
        '比率が弱い場合：実物を定規で測り、スケッチと数値を比較する',
        '線が弱い場合：一発で引くことを意識し、引き直しを禁止にして練習する',
      ],
      successPattern: '特定した弱点が週前半より改善している',
      failPattern: '弱点を見直さずに惰性で描いている',
      duration: 35 * 60,
    },
  ],

  3: [
    {
      task: '楕円角度精度ドリル：0°・30°・60°・90°の4段階を各8個（計32個）',
      warmup: '楕円ウォームアップで今日の4段階の扁平率を先に確認する。0°は直線に近い楕円',
      metrics: ['line', 'ellipse', 'proportion'],
      goal: '視点角度に応じた楕円の扁平率を正確にコントロールし、4段階を描き分けられるようにする',
      tips: [
        '0°（水平面を真横から見る）≒ほぼ直線、30°≒扁平、60°≒やや丸、90°≒正円',
        '各角度の楕円を8個並べて「グラデーション」が自然かを確認する',
        '長軸方向を先に決め、その方向に沿って描く',
        '4段階を1行に並べて描くと扁平率の変化がわかりやすい',
      ],
      successPattern: '4段階の扁平率が明確に異なる、長軸の向きが一定',
      failPattern: '4段階が同じ扁平率、0°と30°が区別できない',
      duration: 35 * 60,
    },
    {
      task: '円柱精度ドリル：コップ（高9cm・上径8cm・底径7cm）×5個、缶（高12cm・径6cm）×5個',
      warmup: '楕円ウォームアップで「上面より底面のほうが少し丸い」扁平率の感覚を確認する',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: '実在する製品の寸法を参考に、比率の正確な円柱を補助線込みで描けるようにする',
      tips: [
        '手順：中心軸→楕円軸→上面楕円→底面楕円→側面縦線の順',
        'コップは上が広がるテーパー形状：上径8・底径7の差を表現する',
        '缶は上下径が同じ（6cm）：側面の縦線が完全に平行',
        '実物のコップや缶を横に置いて比率を比べながら描く',
      ],
      successPattern: 'コップのテーパーが見える、缶の縦線が平行、比率が実物に近い',
      failPattern: 'コップと缶が同じ形、縦線が広がって台形になる',
      duration: 35 * 60,
    },
    {
      task: 'テーパー回転体ドリル：ペットボトル500mlの観察模写×3個（実物またはイメージで）',
      warmup: 'ウォームアップの楕円で「中央が膨らみ、上下が細い」回転体の断面を意識する',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: '複雑な輪郭を持つ回転体を、中心軸と断面楕円で構築できるようにする',
      tips: [
        '描く前にシルエットを観察：最も太い部分・最も細い部分の位置と比率をメモ',
        '中心軸を先に引き、最大径・最小径・口径の3つの楕円軸（水平線）を決める',
        '輪郭曲線は一筆で引く（止まるほど歪む）',
        '左右対称になっているか、中心軸に対して目で確認する',
      ],
      successPattern: '中心軸が通り、左右シルエットが対称、膨らみの位置が実物に近い',
      failPattern: '中心軸なしで外形だけ描いて左右バラバラ、膨らみの位置が違う',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を確認し、その動作だけをウォームアップで10回繰り返してから本題へ',
      metrics: ALL_METRICS,
      goal: '円柱・回転体描写の弱点を克服し、金曜のコーヒーカップ課題に備える',
      tips: [
        '楕円が弱い場合：扁平率を変えた楕円を20個練習し、指定の扁平率に近づける',
        '比率が弱い場合：実物と自分のスケッチを定規で測って誤差を数値化する',
        '線が弱い場合：輪郭の一番重要な1本の線だけに集中して10回描く',
      ],
      successPattern: '弱点軸のスコアが週前半の平均より上がっている',
      failPattern: '同じミスを繰り返し気づいていない',
      duration: 35 * 60,
    },
  ],

  4: [
    {
      task: 'iPhone型スケッチ：正面・背面・側面の3面を補助線込みで各2個（計6個）',
      warmup: 'ラウンドコーナーの曲線精度をウォームアップの楕円1/4弧で確認する',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: 'スマートフォンのような現代的な製品フォームを複数視点で描き分けられるようにする',
      tips: [
        '正面：150×75mmの長方形にR=5mmのコーナー、カメラ穴（直径15mm）を中央上部に',
        '背面：正面と同じ輪郭だが、カメラユニット（左上の正方形）を追加',
        '側面：150×8mmの薄い長方形、音量ボタン（左側の小矩形）を配置',
        '3面を同じ縮尺で横に並べて比率の整合を確認する',
      ],
      successPattern: '3面の比率が整合、ラウンドコーナーが均一、特徴的な要素が配置されている',
      failPattern: '3面でスケールが違う、コーナーの丸みがバラバラ',
      duration: 35 * 60,
    },
    {
      task: 'アイレベル変化ドリル：同じ円柱を「見下ろし（45°）・水平・見上げ（45°）」の3視点で各3個',
      warmup: 'ウォームアップの楕円で扁平率の差を明確に出す練習をしてから本題へ',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: '視点の高さによって楕円の扁平率と見える面が変わることを正確に表現できるようにする',
      tips: [
        '見下ろし45°：上面楕円が大きく（60%前後）、底面はほぼ見えない',
        '水平（0°）：上下の楕円が細い（10〜15%）、ほぼ2本の線で表現',
        '見上げ45°：底面楕円が大きく（60%前後）、上面はほぼ見えない',
        '3視点を縦に並べて描き、楕円の変化がグラデーション状になっているか確認',
      ],
      successPattern: '3視点で楕円の扁平率が明確に異なる、見下ろし↔見上げで上下が逆転',
      failPattern: '3視点で同じ扁平率、水平視点でも上面が大きく描かれている',
      duration: 35 * 60,
    },
    {
      task: 'ワイヤレスマウスの観察模写：実物またはイメージで正面・斜め上の2視点×2個',
      warmup: '有機曲面（なだらかなカーブ）の輪郭線を、ウォームアップのCカーブで感覚を掴んでおく',
      metrics: ['line', 'proportion', 'balance'],
      goal: '直線と曲線が混在する工業製品を、基本形（ラウンドコーナー箱）を起点に描けるようにする',
      tips: [
        'まずラウンドコーナー箱でシルエットを構築し、そこから曲面の変化を追加する',
        'マウスの最も高い点（中央後部）と最も低い点（前端）の位置を先に決める',
        '左右のカーブは必ず中心軸に対して対称になるよう確認する',
        '細部（ホイール・ボタンの溝）より全体シルエットの精度を優先する',
      ],
      successPattern: '全体のシルエットがマウスらしく、左右対称、底面が平ら',
      failPattern: '基本形を使わず細部から描いてシルエットが崩れる',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の最も苦手な動作をウォームアップで重点練習してから本題へ',
      metrics: ALL_METRICS,
      goal: '製品フォーム描写の弱点を克服し、金曜の自分のスマートフォン模写に備える',
      tips: [
        'ラウンドコーナーが弱い場合：コーナー曲線だけを20個練習する',
        '比率が弱い場合：実物を定規で測って比率メモを作り、それを見ながら描く',
        '視点が弱い場合：同じ物を3つの視点から描いて違いを比較する',
      ],
      successPattern: '弱点が週前半より改善している',
      failPattern: '弱点を確認せずに別の練習をしている',
      duration: 35 * 60,
    },
  ],

  5: [
    {
      task: '2製品配置ドリル：スマートフォン+ヘッドフォンを「並列・重なり・前後」の3レイアウトで',
      warmup: '直線と楕円のウォームアップで「共通の消失点に向かう線」の感覚を確認する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '2つの製品を1つの画面に配置し、空間の奥行きを表現できるようにする',
      tips: [
        '先に小さなサムネイル（5cm角）で3レイアウトを決めてから本描きに進む',
        '共通のアイレベルと消失点を先に設定してから各製品を配置する',
        '「前後レイアウト」：手前の製品が大きく、奥の製品が小さい（遠近感）',
        '「重なりレイアウト」：前の製品が奥の製品を一部隠す（オーバーラップ）',
      ],
      successPattern: '3レイアウトが明確に違う、空間の奥行きが感じられる',
      failPattern: 'レイアウトが全部同じ、2製品が同じ大きさで奥行きがない',
      duration: 35 * 60,
    },
    {
      task: '前後の奥行き表現：同じ製品（缶ジュース）を「前・中・後」の3位置に置いたシーン',
      warmup: '楕円の扁平率変化をウォームアップで確認。遠くなるほど楕円は変化する',
      metrics: ['line', 'ellipse', 'proportion', 'balance'],
      goal: 'オーバーラップとサイズ変化で奥行きを表現し、空間を読める絵を描けるようにする',
      tips: [
        '手前が最も大きく（高さ7cm）、中間は5cm、奥は3.5cm（1/2ずつ小さく）',
        '手前の缶が中間の缶の一部を隠す（オーバーラップ）で前後が明確になる',
        '上から見える角度：手前は見えない（水平視点）、奥ほど上面楕円が大きい',
        '3本を描いてから全体を引いた目で奥行き感を確認する',
      ],
      successPattern: '3本のサイズ差が明確、重なりが自然、奥行きが感じられる',
      failPattern: '3本が同じサイズ、重なりの処理が曖昧',
      duration: 35 * 60,
    },
    {
      task: 'デスク俯瞰ドリル：本3冊・ペン・コップをデスク上に置いた状態を斜め45°から',
      warmup: '2点透視の消失点設定をウォームアップの直線で練習してから本題へ',
      metrics: ['line', 'proportion', 'balance'],
      goal: '複数の物体が共存する空間シーンを、統一した透視で描けるようにする',
      tips: [
        'デスクの平面を2点透視で先に描いてから、その上に各物体を配置する',
        '全ての物体が同じVL・VRに向かうことを意識する',
        'まずデスクの縁（手前の長辺）と奥行き線を引き、枠を作ってから中身を描く',
        '物体のサイズはデスクの大きさとの比率で決める（コップはデスクの1/8程度）',
      ],
      successPattern: '全物体が統一した透視に従っている、デスクの奥行きが感じられる',
      failPattern: '物体ごとに透視がバラバラ、全体が平面的',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を1つ選んでウォームアップで集中練習する',
      metrics: ALL_METRICS,
      goal: '空間構成の弱点を補強し、金曜の3点セット課題に備える',
      tips: [
        '透視が弱い場合：消失点1点に向かう線を20本引く練習をする',
        '配置が弱い場合：サムネイルだけを5パターン描いて構成感覚を養う',
      ],
      successPattern: '弱点が週前半より改善している',
      failPattern: '弱点の練習をせず通常ドリルをしている',
      duration: 35 * 60,
    },
  ],

  6: [
    {
      task: '5分スケッチ×4：手元にある4つの物を1つずつ5分で描く（補助線なし、観察重視）',
      warmup: '今日はスピードが目標。ウォームアップは7分に短縮し、高速で引く感覚を掴む',
      metrics: ['line', 'proportion', 'balance'],
      goal: '観察力と描写スピードを同時に鍛え、5分で対象物の特徴を捉えられるようにする',
      tips: [
        '最初の30秒で「何を最初に描くか」を決めてから手を動かす',
        '描き順：全体の縦横比の枠 → 最も特徴的な輪郭 → 主要な内部要素',
        '残り1分で全体を引いた目でバランスを確認し、大きな歪みだけ修正',
        '4個を描いてから「最も特徴を捉えられているもの」を選んで理由を分析する',
      ],
      successPattern: '5分で何の物かわかる絵が完成、全体比率が概ね合っている',
      failPattern: '5分で未完成、細部に時間をかけすぎて全体が崩れる',
      duration: 35 * 60,
    },
    {
      task: '3段階タイムスケッチ：同じ物を「1分→3分→5分」で3回描く（計3セット）',
      warmup: 'ウォームアップを5分に短縮して高速描写の感覚を掴む',
      metrics: ['line', 'proportion', 'balance'],
      goal: '時間が増えるほど何が改善されるかを体験し、「限られた時間の使い方」を学ぶ',
      tips: [
        '1分版：最も重要な輪郭の線だけ（5〜7本以内）',
        '3分版：1分版に内部の主要要素を追加',
        '5分版：3分版に細部と陰影を追加',
        '3段階を並べて「時間投資の効果」を分析する',
      ],
      successPattern: '3段階が明確に違う、時間が増えるほど情報が増える',
      failPattern: '1分版と3分版がほぼ同じ、5分版で比率が崩れる',
      duration: 35 * 60,
    },
    {
      task: '記憶スケッチ：30秒観察→見ないで描く（90秒）を5種の物で繰り返す',
      warmup: '普段通りのウォームアップ。今日は「見る」力を鍛える日',
      metrics: ['proportion', 'balance'],
      goal: '観察で重要な情報を素早く記憶し、見ないで描く力を養う',
      tips: [
        '観察30秒：縦横比・最も特徴的な形・内部の主要要素の3点だけ覚える',
        '描画90秒：比率から描き始め、記憶した特徴を追加する',
        '描いた後に実物と見比べて「何が記憶できていたか」を確認する',
        '5種が終わったら「記憶しやすい情報の共通点」を考える',
      ],
      successPattern: '実物と見比べて主要な比率と特徴が合っている',
      failPattern: '記憶した内容が少なすぎて棒線になる、比率が大幅にずれる',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再度意識してウォームアップを行う',
      metrics: ALL_METRICS,
      goal: 'スピードと観察の弱点を補強する',
      tips: [
        'スピードが弱い場合：1分スケッチをさらに10個繰り返す',
        '観察が弱い場合：30秒観察後に「縦横比・最大の特徴・内部要素3点」を声に出してから描く',
      ],
      successPattern: '弱点が改善されている',
      failPattern: '弱点を特定せずに練習している',
      duration: 35 * 60,
    },
  ],

  7: [
    {
      task: '頭身ドリル：8頭身・4頭身・2頭身の人物を各3体（立ち姿、ガイドライン込み）',
      warmup: 'ウォームアップの直線で「均等な間隔の水平線」を10本引く（頭身のガイドライン練習）',
      metrics: ['line', 'proportion', 'balance'],
      goal: '頭身比率の違いを正確に描き分け、用途に応じた人物表現を習得する',
      tips: [
        '先に頭の高さを決め、それを単位として水平ガイドラインを引いてから描く',
        '8頭身の目安：腰が4頭身目、膝が5.5頭身目、足先が8頭身目',
        '4頭身（ビジネス人物図）：頭1・胴1.5・脚1.5の3分割が基本',
        '2頭身（アイコン的）：頭1・体1の2分割、手足は短く省略',
      ],
      successPattern: '3種の比率が明確に異なる、ガイドラインに沿っている',
      failPattern: '全頭身が同じ大きさに見える、ガイドラインなしで比率がバラバラ',
      duration: 35 * 60,
    },
    {
      task: '姿勢バリエーションドリル：4頭身の人物を「立ち・歩き・腕を上げる」各5体',
      warmup: '直線ウォームアップで重心線（垂直線）の精度を意識する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '重心の移動と関節の角度変化を理解し、姿勢を描き分けられるようにする',
      tips: [
        'まず頭（円）+胴体（長方形）+腕脚（棒線）のシンプルな骨格から描く',
        '立ち：頭の中心から垂直線を引き、その線上に体重が乗る',
        '歩き：前後の足の間隔は1歩幅（身長の約40%）、重心は前の足へ',
        '腕を上げる：肩位置は変わらず、肘から先が上方向に角度を変える',
      ],
      successPattern: '3ポーズが明確に違う、重心が安定して見える',
      failPattern: '全ポーズが似たような直立、重心が傾いて倒れそう',
      duration: 35 * 60,
    },
    {
      task: '座り姿ドリル：「椅子に座る・ソファに沈む・床に座る」の3パターンを各4体',
      warmup: '普段通りのウォームアップ。今日は人体の「折れ曲がる部分（関節）」を意識する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '座り姿勢の関節の折れ方と重心の変化を正確に表現できるようにする',
      tips: [
        '椅子に座る：腰・膝が90°で折れる、背中が椅子の背もたれに接する',
        'ソファに沈む：腰が低く、背中が後傾（45°程度）、膝の高さが上がる',
        '床座り：あぐらは膝が外側に開く、体育座りは膝が胸に近づく',
        '先に椅子・ソファの形を描いてから人物を配置すると関係が自然になる',
      ],
      successPattern: '3パターンの違いが明確、人物と家具の接触が自然',
      failPattern: '全パターンが同じ座り方、家具と人物が浮いている',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再確認し、ウォームアップで重点練習する',
      metrics: ALL_METRICS,
      goal: '人物描写の弱点を克服し、金曜のスマートフォン使用者課題に備える',
      tips: [
        '比率が弱い場合：頭身ガイドラインを引いてから同じポーズを5体描く',
        'バランスが弱い場合：重心線だけを先に引いて、体をその上に乗せる練習',
      ],
      successPattern: '弱点が週前半より改善している',
      failPattern: '弱点の練習をせず別のことをしている',
      duration: 35 * 60,
    },
  ],

  8: [
    {
      task: '手の簡略描写ドリル：製品を「持つ・押す・指さす」手を各5個（簡略スタイル）',
      warmup: 'ウォームアップの楕円で「手のひら=楕円形」の感覚を練習する',
      metrics: ['line', 'proportion', 'balance'],
      goal: 'ロジカルスケッチで使う簡略化された手の描き方を習得し、製品との組み合わせに使えるようにする',
      tips: [
        '手全体を「角丸の長方形（手のひら）+U字型の指の塊+親指」の3パーツで表現',
        '持つ手：まず製品を描いてから、それを包む手の形を外側に追加する',
        '押す手：人差し指1本だけ伸ばし、他4本は「U字の束」としてまとめる',
        '指さす手：人差し指1本伸ばし、他は「丸めた束」として小さく処理する',
      ],
      successPattern: '何をしているかすぐわかる、製品との接触が自然',
      failPattern: '指を1本ずつ描こうとして複雑になりすぎる、手と製品が接触していない',
      duration: 35 * 60,
    },
    {
      task: '手+スマートフォン使用シーンドリル：「片手持ち・両手持ち・横画面操作」各5セット',
      warmup: 'ウォームアップで直線と楕円を確認後、小さい手の形を3個描いて感覚を掴む',
      metrics: ['line', 'proportion', 'balance'],
      goal: '手と製品が一体となった使用シーンを自然に描けるようにする',
      tips: [
        'まずスマートフォンの形を正確に描いてから、その周りに手を追加する',
        '片手持ち：親指が画面にかかり、4本の指が背面を支える',
        '両手持ち：左右の親指が画面中央に向かう',
        '操作中は指先が画面に触れている（浮いていない）ことを意識する',
      ],
      successPattern: '使い方がひと目でわかる、スマートフォンと手の比率が自然',
      failPattern: '手が浮いていて操作していない、スマートフォンと手のサイズが不自然',
      duration: 35 * 60,
    },
    {
      task: '使用シーン構成ドリル：「コーヒーショップでMacBookを使う人物」を背景（テーブル・椅子）込みで2パターン',
      warmup: '2点透視のウォームアップで「テーブルの奥行き線」を練習する',
      metrics: ['line', 'proportion', 'balance'],
      goal: '人物・製品・環境（背景）を1枚の絵に統合し、使用シーンを伝えられるようにする',
      tips: [
        '先にテーブル（2点透視）と椅子の位置を決め、次に人物、最後にMacBookを配置する',
        '人物はテーブルの手前側に座り、MacBookはテーブル上に置く（浮かせない）',
        '背景の描き込みは最小限（テーブルの縁・椅子の脚の線だけ）で十分',
        '人物と製品どちらが主役かを決めて、主役を詳細に・背景を省略して描く',
      ],
      successPattern: '場所と状況がひと目でわかる、人物・製品・環境の関係が自然',
      failPattern: '背景の描き込みが多すぎて主役が埋もれる、人物がテーブルに接していない',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再確認し、ウォームアップで重点練習する',
      metrics: ALL_METRICS,
      goal: '人物と製品の組み合わせ描写の弱点を克服する',
      tips: [
        '手が弱い場合：手の3パーツ（手のひら・指の束・親指）を各10個練習する',
        '構成が弱い場合：サムネイル（5cm角）を5パターン描いて配置の感覚を養う',
      ],
      successPattern: '弱点が週前半より改善している',
      failPattern: '同じ問題を繰り返している',
      duration: 35 * 60,
    },
  ],

  9: [
    {
      task: '最小線数スケッチ：5本以下の線で製品の形を表現する×10個（異なる製品で）',
      warmup: 'ウォームアップを5分に短縮。最も重要な1本を選ぶ感覚を養う',
      metrics: ['line', 'proportion'],
      goal: 'アイデアスケッチで使う「本質的な線だけで伝える」スキルを習得する',
      tips: [
        '5本の線を「縦横の枠2本・最大の特徴3本」で割り振るのが基本',
        '描く前に「この製品を5本の線で表すとしたら何が最重要か」を考える',
        '10個が終わったら「すぐ何かわかるもの」を選んで、なぜわかるかを分析する',
        '線数が少ないほど、各線の精度と配置が重要になる',
      ],
      successPattern: '5本以内で何の製品かわかる、最も特徴的な線が選ばれている',
      failPattern: '5本では何かわからない、重要でない細部に線を使っている',
      duration: 35 * 60,
    },
    {
      task: 'ざっくり→精密変換ドリル：同じ製品を「30秒ざっくり版」と「5分精密版」で3セット',
      warmup: '普通のウォームアップ。今日は「ざっくり」と「精密」の両方の感覚を使う',
      metrics: ['line', 'proportion', 'balance'],
      goal: 'アイデア出しフェーズ（ざっくり）と説明フェーズ（精密）を切り替えられるようにする',
      tips: [
        'ざっくり版：全体の輪郭と最大の特徴だけ、消しゴム禁止',
        '精密版：補助線→外形→内部要素の順で5分かける',
        '2つを並べて「ざっくりで表現できていたこと・できなかったこと」を確認する',
        '3セット後「どのタイミングでざっくりを使うか」を言語化してみる',
      ],
      successPattern: 'ざっくりと精密が明確に異なる、精密版がざっくり版の詳細版になっている',
      failPattern: 'ざっくり版が単なる未完成になっている、2つが同じレベルの詳細度',
      duration: 35 * 60,
    },
    {
      task: '3段階タイムスケッチ（人物+製品）：「10秒・1分・5分」で使用シーンを3回描く×3セット',
      warmup: 'ウォームアップを6分に短縮して速描の感覚を掴む',
      metrics: ['line', 'proportion', 'balance'],
      goal: '人物+製品の使用シーンを様々な時間制限で描けるようにし、「時間に応じた省略」を習得する',
      tips: [
        '10秒：人物（円+線のスティックフィギュア）と製品（四角形のみ）だけ',
        '1分：人物に手と姿勢を追加、製品に特徴的な形を追加',
        '5分：背景・陰影・ラベルを追加して状況を明確に',
        '3段階の進化を見て「何が最初に必要な情報か」を確認する',
      ],
      successPattern: '10秒版でも状況が伝わる、5分版は詳細で説得力がある',
      failPattern: '10秒版で何もわからない、5分版でも精度が10秒版と大差ない',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再確認し、ウォームアップで重点練習する',
      metrics: ALL_METRICS,
      goal: '省略と表現速度の弱点を補強する',
      tips: [
        'スピードが弱い場合：10秒スケッチをさらに10個練習する',
        '省略が弱い場合：5本線スケッチを5個追加練習する',
      ],
      successPattern: '弱点が改善されている',
      failPattern: '弱点を確認せず通常の練習をしている',
      duration: 35 * 60,
    },
  ],

  10: [
    {
      task: '3面明暗法ドリル：製品型直方体（スマートフォン・本・箱）に「白・グレー・濃グレー」を10個',
      warmup: '直線ウォームアップで45°の斜線ハッチングの密度コントロールを練習する',
      metrics: ['balance'],
      goal: 'ロジカルスケッチの陰影法（3段階の面塗り）を製品フォームに素早く適用できるようにする',
      tips: [
        '光源は左上に固定：上面=白・正面=グレー・右側面=濃グレー（常にこの割り当て）',
        '塗り方：45°の平行斜線（面全体を均一な密度で）または鉛筆の面塗り',
        '大事なのは「3段階の明暗差を明確に出すこと」（グラデーションは不要）',
        '10個を連続で描き、陰影をつける速度を上げる（1個3分以内を目標）',
      ],
      successPattern: '3面の明暗差がはっきりしている、どの面かひと目でわかる',
      failPattern: '全面が同じ濃さ、明暗が2段階しかない、塗り方が面によって違う',
      duration: 35 * 60,
    },
    {
      task: '陰影付き円柱+製品フォームドリル：3面明暗法を円柱・コップ・マウスに適用（各3個）',
      warmup: 'ウォームアップの楕円で「上面楕円は明るい」感覚を意識する',
      metrics: ['line', 'balance'],
      goal: '3面明暗法を直方体以外の曲面形態にも応用し、立体感の表現幅を広げる',
      tips: [
        '円柱の陰影：側面を「明→中→暗→ごく薄い反射光」の帯として左から右へ',
        '上面（楕円）は常に最も明るい（光源に一番近い面）',
        'マウスなど複合形態：各パーツ（上面・側面・底面）に3面明暗を適用する',
        '塗り方の速度を意識する（1個の陰影追加は2分以内）',
      ],
      successPattern: '曲面でも明暗の変化が感じられる、組み合わせ形で陰影が一貫している',
      failPattern: '円柱が平面的、上面と側面の明暗が逆転している',
      duration: 35 * 60,
    },
    {
      task: '陰影込み使用シーンスケッチ：Week 8で描いたシーンに3面明暗を加えて描き直す（2パターン）',
      warmup: 'ウォームアップで3面明暗の塗り分けを確認してから本題へ',
      metrics: ['line', 'proportion', 'balance'],
      goal: 'フォーム描写と陰影表現を組み合わせ、完成度の高い使用シーンスケッチを仕上げる',
      tips: [
        '先にフォームを正確に描いてから陰影を後付けする（陰影を先に描かない）',
        '人物・製品・背景の各パーツに独立して3面明暗を適用する',
        '陰影追加の前後を見比べて「立体感の変化」を確認する',
        '背景は陰影を省略し、人物と製品だけに陰影を入れると主役が際立つ',
      ],
      successPattern: '陰影を加えることで立体感が明らかに向上している',
      failPattern: '陰影を先に描こうとしてフォームが崩れる、全要素に同じ陰影をかけている',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再確認し、ウォームアップで重点練習する',
      metrics: ALL_METRICS,
      goal: '陰影表現の弱点を補強する',
      tips: [
        '明暗差が弱い場合：濃グレー面を限界まで濃く塗る練習をする',
        '塗り方が弱い場合：45°斜線のみ20本練習してから面に適用する',
      ],
      successPattern: '弱点が改善されている',
      failPattern: '同じ問題を繰り返している',
      duration: 35 * 60,
    },
  ],

  11: [
    {
      task: '矢印・ラベル・吹き出しの基礎ドリル：3種類を各5個ずつ（スケッチ+注釈の組み合わせ）',
      warmup: '今日は記号の精度。ウォームアップで直線の終点に矢頭をつける練習を追加する',
      metrics: ['proportion', 'balance'],
      goal: 'スケッチに注釈を加えて「説明図」として機能させる基礎スキルを習得する',
      tips: [
        '矢印の原則：対象物の外側から指示線を引き、テキストは線の端に揃える',
        '矢頭は小さく統一する（大きすぎると線に見えなくなる）',
        '吹き出しは発話者から線を引いて対話の向きを示す（方向が逆にならないよう）',
        'テキストは3〜5文字に絞る（「ここ押す」「充電口」「電源」など）',
      ],
      successPattern: '矢印・テキストがスケッチの邪魔をせず、説明がすぐわかる',
      failPattern: '矢印が交差する、テキストがスケッチに重なって読みにくい',
      duration: 35 * 60,
    },
    {
      task: '製品分解図ドリル：製品（イヤホン・充電器）を「全体→パーツ→組み立て順序」で図解する（1製品）',
      warmup: 'ウォームアップで「引き出し線（細く真っ直ぐ）」の精度を練習する',
      metrics: ['proportion', 'balance'],
      goal: '構造や仕組みを視覚的に説明する分解図を描けるようにする',
      tips: [
        '全体図を中央に置き、各パーツを矢印で引き出して周囲に配置する',
        'パーツ間に①②③の数字で組み立て順序を示す',
        '全体図とパーツ図の縮尺は統一するか「×2」などスケール注記をつける',
        '描く前に「全体・パーツ・順序」の3エリアを紙に割り付けてから描く',
      ],
      successPattern: '全体とパーツの対応関係がひと目でわかる、順序が読み取れる',
      failPattern: 'パーツと全体の対応が不明、矢印の向きが混乱している',
      duration: 35 * 60,
    },
    {
      task: '1ページ説明スケッチ：「製品の使い方を3ステップで説明する図」を1枚で完成させる',
      warmup: 'ウォームアップ後、先に5cm角のレイアウトサムネイルを描いてから本題へ',
      metrics: ['proportion', 'balance'],
      goal: 'ロジカルスケッチの最終形「1枚で伝わる説明図」を完成させる力を身につける',
      tips: [
        '先にレイアウト（3ステップ分の配置）を薄く割り付けてから描く',
        '各ステップ：スケッチ（大）＋矢印＋テキスト（短い）のセット',
        'ステップ間は大きな矢印（→）でつないで流れを示す',
        'テキストは10文字以内に絞る、スケッチより小さいフォントサイズ感で',
      ],
      successPattern: '1枚見ただけで3ステップの手順がわかる',
      failPattern: '情報を詰め込みすぎて読みにくい、ステップの流れが不明',
      duration: 35 * 60,
    },
    {
      task: '弱点強化ドリル：直近3セッションの最低スコア軸を集中練習（自動判定）',
      warmup: '週前半の修正動作を再確認し、ウォームアップで重点練習する',
      metrics: ALL_METRICS,
      goal: '説明図の弱点を補強して最終週に備える',
      tips: [
        '矢印が弱い場合：矢印だけを20本練習してから図に組み込む',
        'レイアウトが弱い場合：割り付けサムネイルを5パターン描いて感覚を養う',
      ],
      successPattern: '弱点が改善されている',
      failPattern: 'スケッチの精度だけを追って説明機能を忘れている',
      duration: 35 * 60,
    },
  ],

  12: [
    {
      task: 'UIワイヤーフレームドリル：スマートフォン画面（ホーム・一覧・詳細）を各2パターン',
      warmup: '直線と楕円のウォームアップで「UI要素（ボタン・アイコン・テキスト行）の形」を意識する',
      metrics: ['line', 'proportion', 'balance'],
      goal: 'スマートフォンのUI画面レイアウトを手書きで素早く表現できるようにする',
      tips: [
        'スマートフォンの外枠を先に描いてから画面エリアを決める',
        'ナビゲーションバー（上部）・コンテンツエリア・タブバー（下部）の3分割を基本とする',
        'ボタン：角丸の長方形、アイコン：単純な記号、テキスト行：水平線で表現',
        '画面の要素を描く前に「何を伝えたいか」を決めてからレイアウトする',
      ],
      successPattern: '3種の画面が明確に区別される、要素の配置が読み取れる',
      failPattern: 'ホームと一覧が同じ見た目、UI要素が何かわからない',
      duration: 35 * 60,
    },
    {
      task: '統合スケッチ：プロダクト+人物の使用シーン（陰影込み）を12週の全技術で仕上げる',
      warmup: '普通のウォームアップ。今日は「全技術を使う」意識で各動作を丁寧に',
      metrics: ALL_METRICS,
      goal: '12週で学んだ直線・楕円・透視・人物・陰影・構成の全技術を1枚に統合する',
      tips: [
        '描く前に確認：①形態分解 ②プロポーション ③透視/消失点 ④人物比率 ⑤光源・陰影',
        '補助線を丁寧に引いてから本線を加える',
        '25分で完成させるタイムボックスを設ける',
        '完成後に各技術が使われているか自己チェックリストを作る',
      ],
      successPattern: '全技術要素が1枚に統合されている、状況が伝わる',
      failPattern: '一部の技術だけに集中して他を無視する',
      duration: 35 * 60,
    },
    {
      task: '説明図+人物シーン統合：1ページのコンセプトスケッチ（製品・使用シーン・説明）',
      warmup: 'ウォームアップ後、先に5cm角のレイアウトサムネイルを3案作ってから本題へ',
      metrics: ALL_METRICS,
      goal: '製品コンセプトを1ページのスケッチで説明できる力を習得する',
      tips: [
        '構成要素：メイン使用シーン（大）＋製品詳細図（小）＋説明テキスト',
        '使用シーンには人物を入れて「誰が・どう使うか」を示す',
        '製品詳細図には主要機能を矢印＋テキストで注記する',
        'スケッチ:テキストの比率は7:3程度（テキストに頼りすぎない）',
      ],
      successPattern: '1ページでプロダクトの価値と使い方が伝わる',
      failPattern: 'スケッチとテキストがバラバラで関係が不明',
      duration: 35 * 60,
    },
    {
      task: '最終仕上げ：「自分が考えるサービスのコンセプトスケッチ」を全技術を使って1ページで',
      warmup: 'ウォームアップ後、先に構成要素リストを紙の隅にメモしてから描く',
      metrics: ALL_METRICS,
      goal: '12週の集大成として、自分のアイデアをスケッチで説明できる状態を達成する',
      tips: [
        '急がず、全ての技術を丁寧に積み上げる',
        '補助線・透視・人物・陰影・説明テキスト・矢印すべてを意識して使う',
        '完成後に12週前の自分と今の自分の違いを言語化してメモする',
        '完成したスケッチを写真に撮って保存する（12週の証拠として）',
      ],
      successPattern: '12週で学んだ全技術が高品質で統合されている、アイデアが伝わる',
      failPattern: '焦って雑に仕上げる、技術の一部を省略する',
      duration: 45 * 60,
    },
  ],
}

const FRIDAY_INFO = {
  warmup: 'ウォームアップ後に今週のドリルで学んだ技術を振り返り、金曜課題でどう使うかを考える',
  goal: 'ドリルで身につけた技術を実物の形を描くことに応用する',
  tips: [
    '描く前に「今週のドリルで学んだ技術のどれを使うか」を声に出して確認する',
    '輪郭を描く前に補助線（中心軸・楕円軸・消失点）を薄く引く',
    '全体の縦横比を先に決めてから細部に入る',
    '対象物を横に置いて実物と見比べながら描く',
  ],
  successPattern: '全体の比率が実物に近い、ドリルで学んだ技術が形に活かされている',
  failPattern: '細部から描き始めてプロポーションが崩れる、今週のドリル技術が使われていない',
  duration: 40 * 60,
}

const SATURDAY_INFO = {
  warmup: '金曜フィードバックの「修正動作」をウォームアップで意識的に練習してから本題へ',
  goal: '金曜の課題を振り返り、フィードバックの修正動作を実際のスケッチで試す',
  tips: [
    '金曜のフィードバック「修正動作」を1〜2個選んで意識して描く',
    '同じ対象物を再度描いて「改善前後」を並べて確認する',
    '今回うまくいった点を自分でも言語化してから次に進む',
  ],
  successPattern: '金曜の指摘箇所が改善されている、修正動作が描写に反映されている',
  failPattern: 'フィードバックを読まずにそのまま描き直す、同じミスを繰り返す',
  duration: 35 * 60,
}

const SUNDAY_INFO = {
  warmup: null,
  goal: '今週の練習を振り返り、成長と次週の目標を確認する',
  tips: [
    '週初めと週末のスケッチを並べて具体的な改善点を3つ書き出す',
    '次週で重点的に改善したい動作を1つ選んで言語化する',
  ],
  successPattern: '成長が具体的に言語化されている、次週の目標が明確',
  failPattern: '振り返りを飛ばして次の課題に進む',
}

const FRIDAY_TASKS = {
  1:  '消しゴム（約6×2×1.5cmの直方体）を「正面から」と「斜め45°から」の2視点で描く',
  2:  '自分のスマートフォンを2点透視で斜め上から描く（実物を横に置いて）',
  3:  'コーヒーカップ（持ち手付き）を斜め45°から描く（実物またはイメージで）',
  4:  '自分のスマートフォンの前面と背面を実物を見ながら描く（補助線込み）',
  5:  'ペン・消しゴム・スマートフォンをデスクに置いた状態を斜め45°から描く',
  6:  '手元にある3つの物を15分で連続スケッチ（補助線なし、観察重視）',
  7:  '「スマートフォンを見ている立ち姿の人物」を4頭身で5体描く',
  8:  '「コーヒーショップでMacBookを使う人物」を背景込みで描く',
  9:  '「自分のサービスのユーザーが製品を使っているシーン」を15分で描く',
  10: 'Week 8で描いた「コーヒーショップシーン」に3面明暗法で陰影を加えて描き直す',
  11: '「このアプリの使い方を3ステップで説明する図」をスケッチ+矢印+テキストで1ページ',
  12: '「自分が考えるサービスのコンセプトスケッチ」を製品+人物+説明で1ページ仕上げ',
}

const ALL_WEEK_METRICS = ALL_METRICS

function dayLabel(startWeekday, positionInCycle) {
  return JS_DAY_LABELS[(startWeekday + positionInCycle) % 7]
}

function calendarDaysSince(ts) {
  const start = new Date(ts)
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  return Math.round((todayMidnight.getTime() - startMidnight.getTime()) / 86400000)
}

function getWeekDrills(week) {
  return WEEK_DRILLS[Math.min(week, 12)] ?? WEEK_DRILLS[12]
}

async function getEffectivePosition(db, first) {
  const allSessions = await db.sessions.orderBy('date').toArray()
  const uniqueDates = [...new Set(allSessions.map(s => s.date))].sort()

  const startDate = new Date(first.createdAt)
  const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let submissionIdx = 0
  for (let pos = 0; pos < 84; pos++) {
    const isSunday = (pos % 7) === 6
    if (isSunday) {
      const posDate = new Date(startMidnight.getTime() + pos * 86400000)
      if (today > posDate) continue
      return pos
    } else {
      if (submissionIdx < uniqueDates.length) { submissionIdx++; continue }
      return pos
    }
  }
  return 83
}

async function getThursdayAdaptation(db, weekDrills) {
  const recentSessions = await db.sessions.orderBy('createdAt').reverse().limit(3).toArray()
  if (!recentSessions.length) return { finalIndex: 3, adaptation: null }

  const totals = {}
  const counts = {}
  for (const s of recentSessions) {
    for (const [k, v] of Object.entries(s.scores ?? {})) {
      if (['line', 'ellipse', 'proportion', 'balance'].includes(k)) {
        totals[k] = (totals[k] ?? 0) + v
        counts[k] = (counts[k] ?? 0) + 1
      }
    }
  }

  const keys = Object.keys(totals).filter(k => counts[k] > 0)
  if (!keys.length) return { finalIndex: 3, adaptation: null }

  const weakest = keys.reduce((a, b) =>
    (totals[a] / counts[a]) < (totals[b] / counts[b]) ? a : b
  )
  const avg = (totals[weakest] / counts[weakest]).toFixed(1)
  const metricToIndex = { line: 0, ellipse: 1, proportion: 2, balance: 3 }
  const finalIndex = Math.min(metricToIndex[weakest] ?? 3, weekDrills.length - 1)
  return {
    finalIndex,
    adaptation: `${SCORE_LABELS[weakest]}集中強化（直近3回平均 ${avg}/10）`,
  }
}

export async function getCurrentTask(db) {
  const first = await db.sessions.orderBy('createdAt').first()

  if (!first) {
    const todayWeekday = new Date().getDay()
    const drill = WEEK_DRILLS[1][0]
    return {
      week: 1, dayOfWeek: 0, dayLabel: JS_DAY_LABELS[todayWeekday], dayNum: 1,
      task: drill.task, warmup: drill.warmup, metrics: drill.metrics,
      goal: drill.goal, tips: drill.tips,
      successPattern: drill.successPattern, failPattern: drill.failPattern,
      duration: drill.duration,
      isFriday: false, isSaturday: false, isSunday: false,
      adaptation: null,
    }
  }

  const firstDate = new Date(first.createdAt)
  const startWeekday = firstDate.getDay()
  const daysSinceStart = await getEffectivePosition(db, first)
  const week = Math.min(Math.floor(daysSinceStart / 7) + 1, 12)
  const dayOfWeek = daysSinceStart % 7
  const label = dayLabel(startWeekday, dayOfWeek)
  const dayNum = dayOfWeek + 1
  const isFriday = dayOfWeek === 4
  const isSaturday = dayOfWeek === 5
  const isSunday = dayOfWeek === 6

  if (isSunday) {
    return { week, dayOfWeek, dayLabel: label, dayNum, task: '週の振り返り', ...SUNDAY_INFO, metrics: ALL_WEEK_METRICS, isFriday, isSaturday, isSunday, adaptation: null }
  }

  if (isSaturday) {
    return { week, dayOfWeek, dayLabel: label, dayNum, task: '金曜スケッチのフィードバック強化日', ...SATURDAY_INFO, metrics: ALL_WEEK_METRICS, isFriday, isSaturday, isSunday, adaptation: null }
  }

  if (isFriday) {
    const task = FRIDAY_TASKS[week] ?? '自由課題：自分で対象物を選んで描く'
    return { week, dayOfWeek, dayLabel: label, dayNum, task, ...FRIDAY_INFO, metrics: ALL_WEEK_METRICS, isFriday, isSaturday, isSunday, adaptation: null }
  }

  const weekDrills = getWeekDrills(week)
  const drillIndex = Math.min(dayOfWeek, weekDrills.length - 1)
  let finalIndex = drillIndex
  let adaptation = null

  if (dayOfWeek === 3) {
    const result = await getThursdayAdaptation(db, weekDrills)
    finalIndex = result.finalIndex
    adaptation = result.adaptation
  }

  const drill = weekDrills[finalIndex]
  return {
    week, dayOfWeek, dayLabel: label, dayNum,
    task: drill.task, warmup: drill.warmup, metrics: drill.metrics,
    goal: drill.goal, tips: drill.tips,
    successPattern: drill.successPattern, failPattern: drill.failPattern,
    duration: drill.duration,
    isFriday, isSaturday, isSunday, adaptation,
  }
}

export async function getWeekTasks(db) {
  const first = await db.sessions.orderBy('createdAt').first()

  let week = 1
  let currentDayOfWeek = 0
  let startWeekday = new Date().getDay()

  if (first) {
    const firstDate = new Date(first.createdAt)
    startWeekday = firstDate.getDay()
    const daysSinceStart = await getEffectivePosition(db, first)
    week = Math.min(Math.floor(daysSinceStart / 7) + 1, 12)
    currentDayOfWeek = daysSinceStart % 7
  }

  const fridayTask = FRIDAY_TASKS[week] ?? '自由課題：自分で対象物を選んで描く'
  const weekDrills = getWeekDrills(week)

  const tasks = Array.from({ length: 7 }, (_, i) => {
    const isFriday = i === 4
    const isSaturday = i === 5
    const isSunday = i === 6
    let task
    let metrics = ALL_WEEK_METRICS
    let drillInfo = {}

    if (isSunday) { task = '週の振り返り'; drillInfo = SUNDAY_INFO }
    else if (isSaturday) { task = '金曜スケッチのフィードバック強化日'; drillInfo = SATURDAY_INFO }
    else if (isFriday) { task = fridayTask; drillInfo = FRIDAY_INFO }
    else {
      const drill = weekDrills[Math.min(i, weekDrills.length - 1)]
      task = drill.task
      metrics = drill.metrics
      drillInfo = {
        warmup: drill.warmup, goal: drill.goal, tips: drill.tips,
        successPattern: drill.successPattern, failPattern: drill.failPattern,
      }
    }

    return {
      dayOfWeek: i, dayLabel: dayLabel(startWeekday, i), dayNum: i + 1,
      task, metrics, ...drillInfo,
      isFriday, isSaturday, isSunday,
      isPast: i < currentDayOfWeek,
      isToday: i === currentDayOfWeek,
    }
  })

  return { week, currentDayOfWeek, tasks }
}

export async function getWeekReview(db) {
  const first = await db.sessions.orderBy('createdAt').first()
  if (!first) return null

  const daysSinceStart = calendarDaysSince(first.createdAt)
  const weekStartOffset = Math.floor(daysSinceStart / 7) * 7
  const start = new Date(first.createdAt)
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const weekStartTime = startMidnight.getTime() + weekStartOffset * 86400000

  const weekSessions = await db.sessions
    .where('createdAt').aboveOrEqual(weekStartTime)
    .toArray()

  if (weekSessions.length < 2) return { hasEnough: false }

  const sorted = weekSessions.sort((a, b) => a.createdAt - b.createdAt)
  return { hasEnough: true, first: sorted[0], last: sorted[sorted.length - 1] }
}
