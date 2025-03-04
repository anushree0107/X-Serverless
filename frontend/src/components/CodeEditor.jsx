import React, { useState, useEffect } from 'react';
import { executePythonCode, executeJavaScriptCode } from '../services/api';
import './CodeEditor.css';

const CodeEditor = ({ 
  language, 
  username, 
  onResult, 
  setLoading, 
  isVerified,
  previousFunctions = [] 
}) => {
  const defaultPythonCode = '# Write your Python code here\nprint("Hello, World!")';
  const defaultJSCode = '// Write your JavaScript code here\nconsole.log("Hello, World!");';
  
  const [code, setCode] = useState(language === 'python' ? defaultPythonCode : defaultJSCode);
  const [functionName, setFunctionName] = useState('Unnamed Function');
  const [selectedFunction, setSelectedFunction] = useState(null);

  // Update code when language tab changes
  useEffect(() => {
    if (!selectedFunction) {
      setCode(language === 'python' ? defaultPythonCode : defaultJSCode);
    }
  }, [language, selectedFunction]);

  // Load selected function's code
  const handleFunctionSelect = (e) => {
    const funcId = parseInt(e.target.value);
    if (funcId === 0) {
      setSelectedFunction(null);
      setCode(language === 'python' ? defaultPythonCode : defaultJSCode);
      setFunctionName('Unnamed Function');
    } else {
      const selected = previousFunctions.find(f => f.id === funcId);
      if (selected) {
        setSelectedFunction(selected);
        setCode(selected.code);
        setFunctionName(selected.name);
      }
    }
  };

  const handleRunCode = async () => {
    if (!isVerified) {
      onResult('Error: Please verify your account to run code.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (language === 'python') {
        result = await executePythonCode(username, {
          code,
          name: functionName
        });
      } else {
        result = await executeJavaScriptCode(username, {
          code,
          name: functionName
        });
      }
      
      // Format the output display
      let formattedOutput = `=== EXECUTION RESULT ===\n`;
      if (result.output) {
        formattedOutput += result.output;
      }
      if (result.error) {
        formattedOutput += `\n=== ERROR ===\n${result.error}`;
      }
      formattedOutput += `\n\n=== EXECUTION INFO ===
Cost: $${result.cost.toFixed(2)}
Total cost to date: $${result.total_cost.toFixed(2)}
Function runs: ${result.run_count}
Date: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`;
      
      onResult(formattedOutput);
    } catch (err) {
      onResult(`Error executing code: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="function-selector">
          <label htmlFor="function-select">Load previous function:</label>
          <select id="function-select" onChange={handleFunctionSelect}>
            <option value="0">-- New Function --</option>
            {previousFunctions.map(func => (
              <option key={func.id} value={func.id}>
                {func.name} (Runs: {func.run_count})
              </option>
            ))}
          </select>
        </div>
        
        <div className="function-name">
          <input 
            type="text" 
            value={functionName} 
            onChange={(e) => setFunctionName(e.target.value)} 
            placeholder="Function Name" 
          />
        </div>
        
        <button 
          onClick={handleRunCode} 
          disabled={!isVerified} 
          className="btn btn-primary run-button"
        >
          Run {language === 'python' ? 'Python' : 'JavaScript'}
        </button>
      </div>
      
      <div className="code-area-container">
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={language === 'python' 
            ? "Write your Python code here..." 
            : "Write your JavaScript code here..."}
          spellCheck="false"
          rows={15}
        />
      </div>

      {!isVerified && (
        <div className="verification-warning">
          ⚠️ Please verify your account to execute code.
        </div>
      )}

      <div className="editor-footer">
        <div className="language-indicator">
          {language === 'python' ? 'Python' : 'JavaScript'} Editor
        </div>
        <div className="execution-info">
          Cost per execution: $0.01
        </div>
      </div>
      
      <div className="system-info">
        <div className="info-item">Current Date and Time (UTC): {new Date().toISOString().slice(0, 19).replace('T', ' ')}</div>
        <div className="info-item">User: {username}</div>
      </div>
    </div>
  );
};

export default CodeEditor;