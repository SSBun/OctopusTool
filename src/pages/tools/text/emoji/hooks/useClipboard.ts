/**
 * 剪贴板操作 Hook
 */

import { useState, useCallback } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError(null);
      
      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyError('复制失败');
      setCopied(false);
      
      // 尝试使用旧的 API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopied(true);
        setCopyError(null);
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
        
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        return false;
      }
    }
  }, []);

  const reset = useCallback(() => {
    setCopied(false);
    setCopyError(null);
  }, []);

  return {
    copied,
    copyError,
    copy,
    reset,
  };
}

