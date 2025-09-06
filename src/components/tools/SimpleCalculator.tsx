// ================================================================
// SIMPLE CALCULATOR COMPONENT
// Built-in calculator for practice sessions
// ================================================================

import React, { useState, useEffect } from 'react';

interface SimpleCalculatorProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
}

export const SimpleCalculator: React.FC<SimpleCalculatorProps> = ({ onResult, clearTrigger }) => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  // Reset calculator when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setDisplay('0');
      setOperation(null);
      setPreviousValue(null);
      setWaitingForNewValue(false);
      console.log('🧮 Calculator internal state cleared');
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
        text-lg font-semibold rounded-lg transition-all duration-150
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500
        flex items-center justify-center
        min-h-[3rem] select-none
        ${className}
      `}
      style={style}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-full max-w-3xl mx-auto bg-gray-800 rounded-xl p-3 shadow-2xl">
      {/* Landscape Layout: Display on Left, Buttons on Right */}
      <div className="flex gap-4 h-full min-h-[250px]">
        {/* Display Section - Left Side */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-right text-3xl font-mono text-white min-h-[50px] flex items-center justify-end overflow-hidden">
              <div className="max-w-full truncate">
                {display}
              </div>
            </div>
          </div>
        </div>

        {/* Button Grid - Right Side */}
        <div className="flex-1 min-w-0 max-w-[50%]">
          <div className="grid grid-cols-4 gap-2 h-full grid-rows-5">
            {/* Row 1 */}
            <Button 
              onClick={clearDisplay}
              className="bg-red-500 hover:bg-red-600 text-white col-span-2"
            >
              Clear
            </Button>
            <Button 
              onClick={() => inputOperation('÷')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ÷
            </Button>
            <Button 
              onClick={() => inputOperation('×')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ×
            </Button>

            {/* Row 2 */}
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
              onClick={() => inputOperation('-')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              -
            </Button>

            {/* Row 3 */}
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
              onClick={() => inputOperation('+')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              +
            </Button>

            {/* Row 4 */}
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
              onClick={performCalculation}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl row-span-2"
              style={{ color: 'white', fontSize: '1.5rem' }}
            >
              =
            </Button>

            {/* Row 5 */}
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
          </div>
        </div>
      </div>
    </div>
  );
};