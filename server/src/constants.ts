/** 밸런스 게임 주제 — 매 판 `pickTopic()`에서 하나 랜덤 */
export const BALANCE_GAME_TOPICS = [
  "하루 지나 우동면발 된 라면 vs 다 불어서 가래떡 사이즈 된 떡볶이",
  "집 없이 벤츠 vs 집 있는데 뚜벅이",
  "성격이 더럽지만 돈 잘 버는 남편 vs 인격적이지만 돈 없는 남편",
  "극적으로 둔한 애인 vs 극적으로 예민한 애인",
] as const;

export const AVATAR_COLORS = [
  "#FF6B9D",
  "#4ECDC4",
  "#FFE66D",
  "#A78BFA",
  "#34D399",
  "#FB923C",
  "#60A5FA",
  "#F472B6",
] as const;

export const GAME_DURATION_MS = 5 * 60 * 1000;
export const INACTIVITY_MS = 60 * 1000;
export const PENALTY_SCORE = 10;
export const START_SCORE = 100;
export const MAP_W = 720;
export const MAP_H = 480;
export const PENALTY_ANIM_MS = 2000;
