"""
This file contains high-quality, hardcoded React component templates
that serve as known-good starting points for the generation process.
"""

CALCULATOR_TEMPLATE = """
import React, { useState } from 'react';
import { Plus, Minus, X, Divide, Percent, PlusMinus, Delete } from 'lucide-react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [inTyping, setInTyping] = useState(true);

  const handleNumberClick = (num) => {
    if (inTyping) {
      setDisplay(display === '0' ? String(num) : display + num);
    } else {
      setDisplay(String(num));
      setInTyping(true);
    }
  };

  const handleOperatorClick = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = calculate();
      setCurrentValue(result);
      setDisplay(String(result));
    }

    setInTyping(false);
    setOperator(nextOperator);
  };

  const calculate = () => {
    const inputValue = parseFloat(display);
    if (operator === '+') return currentValue + inputValue;
    if (operator === '-') return currentValue - inputValue;
    if (operator === '*') return currentValue * inputValue;
    if (operator === '/') return currentValue / inputValue;
    return inputValue;
  };

  const handleEqualClick = () => {
    if (!operator) return;
    const result = calculate();
    setCurrentValue(result);
    setDisplay(String(result));
    setOperator(null);
    setInTyping(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setInTyping(true);
  };

  const handleSpecialOperator = (op) => {
    const value = parseFloat(display);
    if (op === 'percent') setDisplay(String(value / 100));
    if (op === 'negate') setDisplay(String(value * -1));
    if (op === 'backspace') setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const Button = ({ onClick, children, className = '' }) => (
    <button
      onClick={onClick}
      className={`rounded-full flex items-center justify-center text-3xl font-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transition-all duration-200 ${className}`}
      style={{ width: '72px', height: '72px' }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans">
      <div className="w-96 p-6 bg-black rounded-3xl shadow-2xl border border-gray-700/50">
        <div className="text-white text-7xl font-thin text-right mb-6 pr-2 h-24 overflow-hidden text-ellipsis">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Button onClick={handleClear} className="bg-gray-600 text-white hover:bg-gray-500">AC</Button>
          <Button onClick={() => handleSpecialOperator('negate')} className="bg-gray-600 text-white hover:bg-gray-500"><PlusMinus size={28} /></Button>
          <Button onClick={() => handleSpecialOperator('percent')} className="bg-gray-600 text-white hover:bg-gray-500"><Percent size={28} /></Button>
          <Button onClick={() => handleOperatorClick('/')} className={`bg-cyan-500 text-white hover:bg-cyan-400 ${operator === '/' ? 'ring-2 ring-white' : ''}`}><Divide size={28} /></Button>

          {[7, 8, 9].map(num => <Button key={num} onClick={() => handleNumberClick(num)} className="bg-gray-800 text-white hover:bg-gray-700">{num}</Button>)}
          <Button onClick={() => handleOperatorClick('*')} className={`bg-cyan-500 text-white hover:bg-cyan-400 ${operator === '*' ? 'ring-2 ring-white' : ''}`}><X size={28} /></Button>

          {[4, 5, 6].map(num => <Button key={num} onClick={() => handleNumberClick(num)} className="bg-gray-800 text-white hover:bg-gray-700">{num}</Button>)}
          <Button onClick={() => handleOperatorClick('-')} className={`bg-cyan-500 text-white hover:bg-cyan-400 ${operator === '-' ? 'ring-2 ring-white' : ''}`}><Minus size={28} /></Button>

          {[1, 2, 3].map(num => <Button key={num} onClick={() => handleNumberClick(num)} className="bg-gray-800 text-white hover:bg-gray-700">{num}</Button>)}
          <Button onClick={() => handleOperatorClick('+')} className={`bg-cyan-500 text-white hover:bg-cyan-400 ${operator === '+' ? 'ring-2 ring-white' : ''}`}><Plus size={28} /></Button>

          <button onClick={() => handleNumberClick(0)} className="col-span-2 rounded-full bg-gray-800 text-white text-3xl font-light text-left pl-8 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transition-all duration-200">0</button>
          <Button onClick={() => handleNumberClick('.')} className="bg-gray-800 text-white hover:bg-gray-700">.</Button>
          <Button onClick={handleEqualClick} className="bg-cyan-500 text-white hover:bg-cyan-400">=</Button>
        </div>
      </div>
    </div>
  );
}
"""

TEMPLATES = {
    "calculator": {
        "appName": "Calculator",
        "description": "A fully functional calculator with a modern dark theme.",
        "code": CALCULATOR_TEMPLATE,
    }
}

def get_all_templates():
    """Returns a list of all available templates, without the full code."""
    return [
        {
            "id": template_id,
            "appName": data["appName"],
            "description": data["description"],
        }
        for template_id, data in TEMPLATES.items()
    ]

def get_template_by_id(template_id: str):
    """Returns the full data for a single template by its ID."""
    return TEMPLATES.get(template_id)
