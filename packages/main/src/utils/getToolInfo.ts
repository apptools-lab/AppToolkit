import consola from 'consola';
import type { ToolsInfo } from '../../../types';
import getLocalToolInfo from './getLocalToolInfo';

const { platform } = process;

export async function getRecommendedToolsInfo() {
  return getToolsInfo('recommended');
}

async function getToolsInfo(category: string) {
  // @ts-expect-error fix the type error
  const defaultToolsInfo = ((await import('@/data/toolsInfo.json')).default) as ToolsInfo;
  const platformToolsInfo = defaultToolsInfo[platform];
  if (!platformToolsInfo) {
    consola.error(`platform ${platform} has no tools info, please check again.`);
    return [];
  }
  const categoryToolsInfo = platformToolsInfo.filter((toolInfo) => {
    return toolInfo.categories.includes(category);
  });
  const categoryToolsFullInfo = [];
  for (const categoryToolInfo of categoryToolsInfo) {
    const localToolInfo = await getLocalToolInfo(categoryToolInfo.type, categoryToolInfo.id);
    categoryToolsFullInfo.push({ ...localToolInfo, ...categoryToolInfo });
  }
  return categoryToolsFullInfo;
}