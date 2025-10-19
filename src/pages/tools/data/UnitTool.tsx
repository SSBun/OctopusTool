import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Calculate, SwapHoriz } from '@mui/icons-material';

type UnitCategory = 'length' | 'weight' | 'temperature';

interface Unit {
  name: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const units: Record<UnitCategory, Record<string, Unit>> = {
  length: {
    meter: {
      name: '米 (m)',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    kilometer: {
      name: '千米 (km)',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    centimeter: {
      name: '厘米 (cm)',
      toBase: (v) => v / 100,
      fromBase: (v) => v * 100,
    },
    millimeter: {
      name: '毫米 (mm)',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    mile: {
      name: '英里 (mi)',
      toBase: (v) => v * 1609.344,
      fromBase: (v) => v / 1609.344,
    },
    yard: {
      name: '码 (yd)',
      toBase: (v) => v * 0.9144,
      fromBase: (v) => v / 0.9144,
    },
    foot: {
      name: '英尺 (ft)',
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    },
    inch: {
      name: '英寸 (in)',
      toBase: (v) => v * 0.0254,
      fromBase: (v) => v / 0.0254,
    },
  },
  weight: {
    kilogram: {
      name: '千克 (kg)',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    gram: {
      name: '克 (g)',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    milligram: {
      name: '毫克 (mg)',
      toBase: (v) => v / 1000000,
      fromBase: (v) => v * 1000000,
    },
    ton: {
      name: '吨 (t)',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    pound: {
      name: '磅 (lb)',
      toBase: (v) => v * 0.453592,
      fromBase: (v) => v / 0.453592,
    },
    ounce: {
      name: '盎司 (oz)',
      toBase: (v) => v * 0.0283495,
      fromBase: (v) => v / 0.0283495,
    },
  },
  temperature: {
    celsius: {
      name: '摄氏度 (°C)',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    fahrenheit: {
      name: '华氏度 (°F)',
      toBase: (v) => (v - 32) * 5 / 9,
      fromBase: (v) => v * 9 / 5 + 32,
    },
    kelvin: {
      name: '开尔文 (K)',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  },
};

export const UnitTool: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');

  const handleConvert = () => {
    if (!inputValue) return;
    
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    const baseValue = units[category][fromUnit].toBase(value);
    const convertedValue = units[category][toUnit].fromBase(baseValue);
    
    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) {
      setInputValue(result);
      setResult('');
    }
  };

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    const unitKeys = Object.keys(units[newCategory]);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1]);
    setInputValue('');
    setResult('');
  };

  return (
    <Container maxWidth="md">
      <ToolDetailHeader
        title="单位转换工具"
        description="长度、重量、温度等单位转换"
        toolPath="/tools/data/unit-converter"
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={category}
          onChange={(_, value) => handleCategoryChange(value)}
          variant="fullWidth"
        >
          <Tab label="长度" value="length" />
          <Tab label="重量" value="weight" />
          <Tab label="温度" value="temperature" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          从
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="输入值"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ flex: 2 }}
          />
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>单位</InputLabel>
            <Select
              value={fromUnit}
              label="单位"
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {Object.entries(units[category]).map(([key, unit]) => (
                <MenuItem key={key} value={key}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={handleSwapUnits}
          >
            交换单位
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          到
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="结果"
            value={result}
            InputProps={{ readOnly: true }}
            sx={{
              flex: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
              },
            }}
          />
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>单位</InputLabel>
            <Select
              value={toUnit}
              label="单位"
              onChange={(e) => setToUnit(e.target.value)}
            >
              {Object.entries(units[category]).map(([key, unit]) => (
                <MenuItem key={key} value={key}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          startIcon={<Calculate />}
          onClick={handleConvert}
          fullWidth
          disabled={!inputValue}
        >
          转换
        </Button>
      </Paper>

      <Paper sx={{ p: 3, bgcolor: 'primary.main', opacity: 0.9 }}>
        <Typography variant="body2" color="white" fontWeight={500}>
          💡 提示：点击"交换单位"可以快速切换转换方向
        </Typography>
      </Paper>
    </Container>
  );
};

