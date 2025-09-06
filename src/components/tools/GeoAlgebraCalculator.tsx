// ================================================================
// GEOALGEBRA CALCULATOR COMPONENT
// Advanced graphing calculator for grades 9-12 mathematics
// ================================================================

import React, { useState, useEffect } from 'react';
import { X, Grid, Sigma, Calculator, Zap } from 'lucide-react';

interface GeoAlgebraCalculatorProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
}

export const GeoAlgebraCalculator: React.FC<GeoAlgebraCalculatorProps> = ({ onResult, clearTrigger }) => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [mode, setMode] = useState<'calculator' | 'graphing' | 'functions'>('calculator');
  const [expression, setExpression] = useState('');
  const [variables, setVariables] = useState<{[key: string]: number}>({});

  // Reset calculator when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setDisplay('0');
      setOperation(null);
      setPreviousValue(null);
      setWaitingForNewValue(false);
      setExpression('');
      setVariables({});
      console.log('🧮 GeoAlgebra Calculator internal state cleared');
    }
  }, [clearTrigger]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
      
      // Send result to parent component
      if (onResult) {
        onResult(String(newValue));
      }
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const newValue = calculate(parseFloat(previousValue), inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
      
      // Send result to parent component
      if (onResult) {
        onResult(String(newValue));
      }
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNewValue(false);
    setExpression('');
  };

  const inputFunction = (func: string) => {
    const currentInput = display === '0' ? '' : display;
    const newExpression = currentInput + func + '(';
    setDisplay(newExpression);
    setExpression(newExpression);
  };

  const inputConstant = (constant: string) => {
    const value = {
      'π': Math.PI.toString(),
      'e': Math.E.toString(),
      '√': 'sqrt('
    }[constant] || constant;
    
    if (waitingForNewValue) {
      setDisplay(value);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? value : display + value);
    }
  };

  const Button: React.FC<{ 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
    style?: React.CSSProperties;
  }> = ({ onClick, className = '', children, style }) => (
    <button
      onClick={onClick}
      className={`
        text-sm font-semibold rounded-lg transition-all duration-150
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500
        flex items-center justify-center
        min-h-[2.5rem] select-none
        ${className}
      `}
      style={style}
    >
      {children}
    </button>
  );

  const ModeButton: React.FC<{ 
    isActive: boolean; 
    onClick: () => void; 
    icon: React.ReactNode; 
    label: string 
  }> = ({ isActive, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-all
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="w-full h-full max-w-4xl mx-auto bg-gray-800 rounded-xl p-3 shadow-2xl">
      {/* Mode Selector */}
      <div className="flex justify-center space-x-2 mb-3">
        <ModeButton
          isActive={mode === 'calculator'}
          onClick={() => setMode('calculator')}
          icon={<Calculator className="w-3 h-3" />}
          label="Calculator"
        />
        <ModeButton
          isActive={mode === 'graphing'}
          onClick={() => setMode('graphing')}
          icon={<Grid className="w-3 h-3" />}
          label="Graphing"
        />
        <ModeButton
          isActive={mode === 'functions'}
          onClick={() => setMode('functions')}
          icon={<Sigma className="w-3 h-3" />}
          label="Functions"
        />
      </div>

      {/* Landscape Layout: Display on Left, Buttons on Right */}
      <div className="flex gap-4 h-full min-h-[280px]">
        {/* Display Section - Left Side */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-gray-900 rounded-lg p-4 flex-1">
            <div className="text-right text-2xl font-mono text-white min-h-[40px] flex items-center justify-end mb-2 overflow-hidden">
              <div className="max-w-full truncate">
                {display}
              </div>
            </div>
            {expression && (
              <div className="text-right text-sm text-gray-400 mb-2">
                Expression: {expression}
              </div>
            )}
            
            {/* Graphing Area (when in graphing mode) */}
            {mode === 'graphing' && (
              <div className="bg-gray-800 rounded border border-gray-600 h-32 flex items-center justify-center">
                <div className="text-gray-400 text-sm">
                  <Grid className="w-8 h-8 mx-auto mb-2" />
                  Graphing View
                </div>
              </div>
            )}

            {/* Function Library (when in functions mode) */}
            {mode === 'functions' && (
              <div className="bg-gray-800 rounded border border-gray-600 h-32 p-2 overflow-y-auto">
                <div className="text-gray-400 text-xs space-y-1">
                  <div>sin(x), cos(x), tan(x)</div>
                  <div>log(x), ln(x), sqrt(x)</div>
                  <div>x², x³, x^n</div>
                  <div>|x|, floor(x), ceil(x)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Button Grid - Right Side */}
        <div className="flex-1 min-w-0 max-w-[50%]">
          <div className="grid grid-cols-5 gap-1 h-full grid-rows-6 text-xs">
            {/* Row 1 - Functions */}
            <Button 
              onClick={() => inputFunction('sin')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              sin
            </Button>
            <Button 
              onClick={() => inputFunction('cos')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              cos
            </Button>
            <Button 
              onClick={() => inputFunction('tan')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              tan
            </Button>
            <Button 
              onClick={() => inputConstant('π')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              π
            </Button>
            <Button 
              onClick={() => inputConstant('e')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              e
            </Button>

            {/* Row 2 - Advanced Functions */}
            <Button 
              onClick={() => inputFunction('log')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              log
            </Button>
            <Button 
              onClick={() => inputFunction('ln')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              ln
            </Button>
            <Button 
              onClick={() => inputConstant('√')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              √
            </Button>
            <Button 
              onClick={() => inputOperation('^')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              x^y
            </Button>
            <Button 
              onClick={clearDisplay}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Clear
            </Button>

            {/* Row 3 - Numbers and Operations */}
            <Button 
              onClick={() => inputNumber('7')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              7
            </Button>
            <Button 
              onClick={() => inputNumber('8')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              8
            </Button>
            <Button 
              onClick={() => inputNumber('9')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              9
            </Button>
            <Button 
              onClick={() => inputOperation('÷')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ÷
            </Button>
            <Button 
              onClick={() => inputNumber('(')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              (
            </Button>

            {/* Row 4 */}
            <Button 
              onClick={() => inputNumber('4')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              4
            </Button>
            <Button 
              onClick={() => inputNumber('5')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              5
            </Button>
            <Button 
              onClick={() => inputNumber('6')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              6
            </Button>
            <Button 
              onClick={() => inputOperation('×')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ×
            </Button>
            <Button 
              onClick={() => inputNumber(')')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              )
            </Button>

            {/* Row 5 */}
            <Button 
              onClick={() => inputNumber('1')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              1
            </Button>
            <Button 
              onClick={() => inputNumber('2')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              2
            </Button>
            <Button 
              onClick={() => inputNumber('3')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              3
            </Button>
            <Button 
              onClick={() => inputOperation('-')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              -
            </Button>
            <Button 
              onClick={() => inputNumber('x')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              x
            </Button>

            {/* Row 6 */}
            <Button 
              onClick={() => inputNumber('0')}
              className="bg-gray-600 hover:bg-gray-500 text-white col-span-2"
            >
              0
            </Button>
            <Button 
              onClick={() => inputNumber('.')}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              .
            </Button>
            <Button 
              onClick={() => inputOperation('+')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              +
            </Button>
            <Button 
              onClick={performCalculation}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
              style={{ color: 'white', fontSize: '1rem' }}
            >
              =
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};