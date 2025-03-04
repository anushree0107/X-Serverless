import React from 'react';
import './OutputConsole.css'; // Make sure to create this CSS file

const OutputConsole = ({ output, loading }) => {
  return (
    <div className="output-console">
      {loading ? (
        <div className="console-loading">
          <div className="loading-spinner"></div>
          <p>Executing code...</p>
        </div>
      ) : (
        <pre className="console-output">
          {output || 'No output to display. Run your code to see results here.'}
        </pre>
      )}
    </div>
  );
};

export default OutputConsole;