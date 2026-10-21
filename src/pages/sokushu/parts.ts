// 学習の3つの「編」。プロファイル（とSDKバージョン）を選んだあとの画面で、どの編に進むかを選ぶ。
// 入門編 = 入門講座（内部番号 101〜106）、本編 = 第1〜13章と付録（第14章 NEM）、
// 演習編 = 本編の章ごとの演習（内部番号 201〜。201 = 第1章 アカウント = 本編 第3章、202 = 第2章 トランザクション = 本編 第4章、203 = 第3章 モザイク = 本編 第5章、204 = 第4章 ネームスペース = 本編 第6章、205 = 第5章 メタデータ = 本編 第7章に対応）と、総合の演習（内部番号 15。表示する章番号は SDK で変わる）。
export type Part = 'intro' | 'main' | 'exercise';

export const EXERCISE_CHAPTERS: readonly number[] = [15];

export const partOf = (no: number): Part => (no > 200 ? 'exercise' : no > 100 ? 'intro' : EXERCISE_CHAPTERS.includes(no) ? 'exercise' : 'main');

export const PARTS: readonly { id: Part; glyph: string; title: string; lead: string; desc: string }[] = [
  { id: 'intro', glyph: '入', title: '入門編', lead: '本編を読むための土台づくり',
    desc: 'JavaScript、データの表現、暗号の基礎、ブロックチェーン基礎、Symbol、NEM（任意）。コードを読む力と、Symbolの考え方を身につけます。' },
  { id: 'main', glyph: '本', title: '本編', lead: '速習Symbol',
    desc: '環境構築から、アカウント、トランザクション、モザイク、ネームスペース、マルチシグ、検証まで。コードをその場で実行しながら進めます。' },
  { id: 'exercise', glyph: '演', title: '演習編', lead: '章ごとの演習と、総合演習',
    desc: '本編の章ごとに、クイズとハンズオン演習で理解を確かめます。アカウントから検証まで進んだあと、ここまでの機能を組み合わせる総合演習に取り組みます。' },
];
