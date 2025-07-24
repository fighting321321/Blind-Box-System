import api from './api';

// 删除展示
export const deleteShowcase = (showcaseId) => {
  return api.delete(`/player-showcase/${showcaseId}`);
};
