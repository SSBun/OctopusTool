/**
 * Emoji 肤色选择器组件
 */

import React, { useState } from 'react';
import {
  Box,
  Popover,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  alpha,
} from '@mui/material';
import { SKIN_TONES } from './types';
import { applySkinTone, hasSkinToneSupport } from './utils/emojiUtils';

interface EmojiSkinToneProps {
  baseEmoji: string;
  currentTone: number;
  onToneSelect: (tone: number, emoji: string) => void;
}

export const EmojiSkinTone: React.FC<EmojiSkinToneProps> = ({
  baseEmoji,
  currentTone,
  onToneSelect,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (hasSkinToneSupport(baseEmoji)) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (tone: number) => {
    const emojiWithTone = applySkinTone(baseEmoji, tone);
    onToneSelect(tone, emojiWithTone);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const supportsSkinTone = hasSkinToneSupport(baseEmoji);

  if (!supportsSkinTone) {
    return null;
  }

  return (
    <>
      <Tooltip title="选择肤色">
        <IconButton
          size="small"
          onClick={handleOpen}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <Box sx={{ fontSize: '1.2rem' }}>
            {applySkinTone(baseEmoji, currentTone)}
          </Box>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            选择肤色
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {SKIN_TONES.map((tone) => {
              const emojiWithTone = applySkinTone(baseEmoji, tone.id);
              const isSelected = tone.id === currentTone;
              
              return (
                <Tooltip key={tone.id} title={tone.name}>
                  <IconButton
                    onClick={() => handleSelect(tone.id)}
                    sx={{
                      width: 48,
                      height: 48,
                      border: isSelected ? 2 : 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      backgroundColor: isSelected
                        ? (theme) => alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Box sx={{ fontSize: '1.5rem' }}>
                      {emojiWithTone}
                    </Box>
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

