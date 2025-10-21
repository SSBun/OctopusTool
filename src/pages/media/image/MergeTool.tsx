import React, { useState, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Slider,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Grid,
  SelectChangeEvent,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ColorPicker } from '../../../components/ColorPicker';
import {
  Download,
  Delete,
  Add,
  ViewColumn,
  ViewStream,
  GridOn,
  DragIndicator,
  ArrowUpward,
  ArrowDownward,
  Refresh,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface SortableItemProps {
  id: string;
  image: ImageItem;
  index: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  image,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'background.paper',
        border: isDragging ? 2 : 1,
        borderColor: isDragging ? 'primary.main' : 'divider',
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
        }}
      >
        <DragIndicator />
      </Box>

      <Box
        component="img"
        src={image.preview}
        alt={image.file.name}
        sx={{
          width: 60,
          height: 60,
          objectFit: 'cover',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap fontWeight={500}>
          {index + 1}. {image.file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {image.width} × {image.height} • {(image.file.size / 1024).toFixed(1)} KB
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.5}>
        <Tooltip title="上移">
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="下移">
          <span>
            <IconButton
              size="small"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
            >
              <ArrowDownward fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => onRemove(id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

type MergeDirection = 'vertical' | 'horizontal' | 'grid';
type AlignMode = 'start' | 'center' | 'end' | 'stretch';

export const MergeTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<MergeDirection>('vertical');
  const [spacing, setSpacing] = useState<number>(10);
  const [padding, setPadding] = useState<number>(20);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [alignMode, setAlignMode] = useState<AlignMode>('center');
  const [gridColumns, setGridColumns] = useState<number>(2);
  const [showDivider, setShowDivider] = useState<boolean>(false);
  const [dividerColor, setDividerColor] = useState<string>('#CCCCCC');
  const [dividerWidth, setDividerWidth] = useState<number>(2);
  const [mergedImage, setMergedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadImage = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: e.target?.result as string,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    setError('');
    setSuccess('');

    try {
      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      
      if (validFiles.length === 0) {
        setError('请选择图片文件');
        return;
      }

      const loadedImages = await Promise.all(validFiles.map(loadImage));
      setImages((prev) => [...prev, ...loadedImages]);
      setSuccess(`成功添加 ${loadedImages.length} 张图片`);
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('加载图片失败');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => arrayMove(prev, index, index - 1));
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => arrayMove(prev, index, index + 1));
  };

  const clearAll = () => {
    setImages([]);
    setMergedImage('');
    setSuccess('');
    setError('');
  };

  const mergeImages = useCallback(async () => {
    if (images.length === 0) {
      setError('请至少添加一张图片');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // 加载所有图片
      const loadedImages = await Promise.all(
        images.map(
          (item) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = item.preview;
            })
        )
      );

      let canvasWidth = 0;
      let canvasHeight = 0;

      // 计算画布尺寸和位置
      const positions: Array<{ x: number; y: number; width: number; height: number }> = [];

      if (direction === 'vertical') {
        // 垂直拼接
        const maxWidth = Math.max(...loadedImages.map((img) => img.width));
        canvasWidth = maxWidth + padding * 2;
        canvasHeight = padding * 2 + (images.length - 1) * spacing;

        let currentY = padding;
        loadedImages.forEach((img) => {
          const imgWidth = alignMode === 'stretch' ? maxWidth : img.width;
          const imgHeight = alignMode === 'stretch' ? (img.height * maxWidth) / img.width : img.height;

          let x = padding;
          if (alignMode === 'center') {
            x = padding + (maxWidth - imgWidth) / 2;
          } else if (alignMode === 'end') {
            x = padding + maxWidth - imgWidth;
          }

          positions.push({
            x,
            y: currentY,
            width: imgWidth,
            height: imgHeight,
          });

          canvasHeight += imgHeight;
          currentY += imgHeight + spacing;
        });
      } else if (direction === 'horizontal') {
        // 水平拼接
        const maxHeight = Math.max(...loadedImages.map((img) => img.height));
        canvasHeight = maxHeight + padding * 2;
        canvasWidth = padding * 2 + (images.length - 1) * spacing;

        let currentX = padding;
        loadedImages.forEach((img) => {
          const imgHeight = alignMode === 'stretch' ? maxHeight : img.height;
          const imgWidth = alignMode === 'stretch' ? (img.width * maxHeight) / img.height : img.width;

          let y = padding;
          if (alignMode === 'center') {
            y = padding + (maxHeight - imgHeight) / 2;
          } else if (alignMode === 'end') {
            y = padding + maxHeight - imgHeight;
          }

          positions.push({
            x: currentX,
            y,
            width: imgWidth,
            height: imgHeight,
          });

          canvasWidth += imgWidth;
          currentX += imgWidth + spacing;
        });
      } else {
        // 网格拼接
        const cols = gridColumns;
        const rows = Math.ceil(images.length / cols);
        
        const cellWidth = Math.max(...loadedImages.map((img) => img.width));
        const cellHeight = Math.max(...loadedImages.map((img) => img.height));

        canvasWidth = padding * 2 + cellWidth * cols + spacing * (cols - 1);
        canvasHeight = padding * 2 + cellHeight * rows + spacing * (rows - 1);

        loadedImages.forEach((img, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;

          const imgWidth = alignMode === 'stretch' ? cellWidth : img.width;
          const imgHeight = alignMode === 'stretch' ? cellHeight : img.height;

          let x = padding + col * (cellWidth + spacing);
          let y = padding + row * (cellHeight + spacing);

          if (alignMode === 'center') {
            x += (cellWidth - imgWidth) / 2;
            y += (cellHeight - imgHeight) / 2;
          } else if (alignMode === 'end') {
            x += cellWidth - imgWidth;
            y += cellHeight - imgHeight;
          }

          positions.push({
            x,
            y,
            width: imgWidth,
            height: imgHeight,
          });
        });
      }

      // 设置画布尺寸和背景色
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 绘制图片
      loadedImages.forEach((img, index) => {
        const pos = positions[index];
        ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
      });

      // 绘制分隔线
      if (showDivider && images.length > 1) {
        ctx.strokeStyle = dividerColor;
        ctx.lineWidth = dividerWidth;

        if (direction === 'vertical') {
          positions.slice(0, -1).forEach((pos) => {
            const lineY = pos.y + pos.height + spacing / 2;
            ctx.beginPath();
            ctx.moveTo(padding, lineY);
            ctx.lineTo(canvasWidth - padding, lineY);
            ctx.stroke();
          });
        } else if (direction === 'horizontal') {
          positions.slice(0, -1).forEach((pos) => {
            const lineX = pos.x + pos.width + spacing / 2;
            ctx.beginPath();
            ctx.moveTo(lineX, padding);
            ctx.lineTo(lineX, canvasHeight - padding);
            ctx.stroke();
          });
        }
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setMergedImage(dataUrl);
      setSuccess('图片拼接成功！');
    } catch (err) {
      setError('拼接失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsProcessing(false);
    }
  }, [
    images,
    direction,
    spacing,
    padding,
    backgroundColor,
    alignMode,
    gridColumns,
    showDivider,
    dividerColor,
    dividerWidth,
  ]);

  const handleDownload = () => {
    if (!mergedImage) return;

    const link = document.createElement('a');
    link.href = mergedImage;
    link.download = `merged-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('图片已下载');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ToolDetailHeader
        title="图片拼接"
        description="将多张图片拼接成一张长图，支持垂直、水平和网格布局"
      />

      <Grid container spacing={3}>
        {/* 左侧：图片列表和设置 */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* 上传区域 */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📁 添加图片
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                选择图片（支持多选）
              </Button>

              {images.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    已添加 {images.length} 张图片
                  </Typography>
                  <Button size="small" startIcon={<Refresh />} onClick={clearAll}>
                    清空全部
                  </Button>
                </Box>
              )}
            </Paper>

            {/* 图片列表 */}
            {images.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  🖼️ 图片列表（拖动排序）
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map((img) => img.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack spacing={1}>
                      {images.map((image, index) => (
                        <SortableItem
                          key={image.id}
                          id={image.id}
                          image={image}
                          index={index}
                          onRemove={removeImage}
                          onMoveUp={moveUp}
                          onMoveDown={moveDown}
                          isFirst={index === 0}
                          isLast={index === images.length - 1}
                        />
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              </Paper>
            )}

            {/* 拼接设置 */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                ⚙️ 拼接设置
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2.5}>
                {/* 拼接方向 */}
                <Box>
                  <Typography variant="body2" gutterBottom fontWeight={500}>
                    拼接方向
                  </Typography>
                  <ToggleButtonGroup
                    value={direction}
                    exclusive
                    onChange={(_, value) => value && setDirection(value)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="vertical">
                      <ViewStream sx={{ mr: 1 }} fontSize="small" />
                      垂直
                    </ToggleButton>
                    <ToggleButton value="horizontal">
                      <ViewColumn sx={{ mr: 1 }} fontSize="small" />
                      水平
                    </ToggleButton>
                    <ToggleButton value="grid">
                      <GridOn sx={{ mr: 1 }} fontSize="small" />
                      网格
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* 网格列数 */}
                {direction === 'grid' && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      网格列数：<strong>{gridColumns}</strong>
                    </Typography>
                    <Slider
                      value={gridColumns}
                      onChange={(_, value) => setGridColumns(value as number)}
                      min={2}
                      max={5}
                      step={1}
                      marks
                      size="small"
                    />
                  </Box>
                )}

                {/* 对齐方式 */}
                <FormControl fullWidth size="small">
                  <InputLabel>对齐方式</InputLabel>
                  <Select
                    value={alignMode}
                    label="对齐方式"
                    onChange={(e: SelectChangeEvent) => setAlignMode(e.target.value as AlignMode)}
                  >
                    <MenuItem value="start">靠前对齐</MenuItem>
                    <MenuItem value="center">居中对齐</MenuItem>
                    <MenuItem value="end">靠后对齐</MenuItem>
                    <MenuItem value="stretch">拉伸填充</MenuItem>
                  </Select>
                </FormControl>

                {/* 间距 */}
                <Box>
                  <Typography variant="body2" gutterBottom>
                    图片间距：<strong>{spacing}px</strong>
                  </Typography>
                  <Slider
                    value={spacing}
                    onChange={(_, value) => setSpacing(value as number)}
                    min={0}
                    max={100}
                    step={5}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* 边距 */}
                <Box>
                  <Typography variant="body2" gutterBottom>
                    画布边距：<strong>{padding}px</strong>
                  </Typography>
                  <Slider
                    value={padding}
                    onChange={(_, value) => setPadding(value as number)}
                    min={0}
                    max={100}
                    step={5}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* 背景色 */}
                <ColorPicker
                  label="背景颜色"
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  fullWidth
                />

                {/* 分隔线 */}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showDivider}
                        onChange={(e) => setShowDivider(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        添加分隔线
                      </Typography>
                    }
                    sx={{ mb: showDivider ? 2 : 0 }}
                  />
                  
                  {showDivider && (
                    <Stack spacing={1.5}>
                      <ColorPicker
                        label="分隔线颜色"
                        value={dividerColor}
                        onChange={setDividerColor}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="粗细 (px)"
                        value={dividerWidth}
                        onChange={(e) => setDividerWidth(Number(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
                        fullWidth
                      />
                    </Stack>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={mergeImages}
                  disabled={images.length === 0 || isProcessing}
                >
                  {isProcessing ? '拼接中...' : '开始拼接'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* 右侧：预览和下载 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              👁️ 预览
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {mergedImage ? (
              <Box>
                <Box
                  sx={{
                    maxHeight: 600,
                    overflow: 'auto',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    bgcolor: 'action.hover',
                    p: 2,
                    // 自定义滚动条样式（主题适配）- 强制规范
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.palette.primary.main,
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.dark,
                      },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={mergedImage}
                    alt="合并后的图片"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      boxShadow: 2,
                    }}
                  />
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  下载拼接图片
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  📸 等待拼接
                </Typography>
                <Typography variant="body2">
                  添加图片并点击"开始拼接"查看预览
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="info.main">
          💡 使用说明
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" component="div" color="text.secondary">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>支持一次上传多张图片，或多次上传添加更多图片</li>
            <li>可以通过拖拽图标拖动调整图片顺序，或使用上下箭头按钮</li>
            <li>垂直拼接：图片从上到下排列，适合制作长微博</li>
            <li>水平拼接：图片从左到右排列，适合制作对比图</li>
            <li>网格拼接：按网格排列，可设置列数，适合相册展示</li>
            <li>对齐方式：靠前/居中/靠后对齐，或拉伸填充保持统一</li>
            <li>可以设置图片间距、画布边距和背景颜色</li>
            <li>支持添加分隔线，可自定义颜色和粗细</li>
            <li>导出为 PNG 格式，保持高清质量</li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

