import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { NewsId } from '@app/shared/dtos/news.dto';

import { NEWS_COVER_PREFIX } from './news.constants';

export function extractTiptapText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  const currentNode = node as {
    text?: unknown;
    content?: unknown;
  };

  const ownText = typeof currentNode.text === 'string' ? currentNode.text : '';

  const childrenText = Array.isArray(currentNode.content)
    ? currentNode.content.map(extractTiptapText).join(' ')
    : '';

  return [ownText, childrenText].filter(Boolean).join(' ');
}

export function buildNewsSearchText(news: {
  title: string;
  summary: string;
  content: Record<string, unknown>;
  tags: string[];
}): string {
  return [
    news.title,
    news.summary,
    extractTiptapText(news.content),
    news.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export const getNewsCoverPath = (
  newsId: NewsId,
  coverImageFilename: string,
): string => {
  return `news/${newsId}/${NEWS_COVER_PREFIX}/${coverImageFilename}`;
};

export const createNewsCoverFilename = (
  originalFilename: string,
  mimeType: string,
): string => {
  const originalExtension = extname(originalFilename).toLowerCase();
  const mimeExtension = mimeType.split('/')[1]?.split('+')[0];
  const extension =
    originalExtension || (mimeExtension ? `.${mimeExtension}` : '');

  return `${randomUUID()}${extension}`;
};

export const normalizeNewsTags = (tags?: string[]): string[] => {
  if (!tags?.length) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
};
