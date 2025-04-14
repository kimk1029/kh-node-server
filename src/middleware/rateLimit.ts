import rateLimit from "express-rate-limit";

export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분당 최대 5회 요청
  message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
});

export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 15분당 최대 10회 요청
  message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
}); 